<?php

namespace Drupal\ncids_html_transformer\Drush\Commands;

use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;
use Drupal\node\Entity\Node;
use Drush\Attributes as CLI;
use Drush\Boot\DrupalBootLevels;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * A Drush commandfile to migrate cgov articles to NCIDS.
 */
class CgovMigrateToNcidsCommands extends DrushCommands {

  use StringTranslationTrait;

  use AutowireTrait;

  /**
   * Constructs a new CgovMigrateToNcidsCommands object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   * @param \Drupal\Core\Entity\EntityFieldManagerInterface $entityFieldManager
   *   The entity field manager.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected EntityFieldManagerInterface $entityFieldManager,
  ) {
    parent::__construct();
  }

  /**
   * Update node body HTML in the specified content type bundle to NCIDS format.
   */
  #[CLI\Command(name: 'cgov:migrate-body-to-ncids', aliases: ['cgov:m-b-ncids'])]
  #[CLI\Bootstrap(level: DrupalBootLevels::FULL)]
  #[CLI\Usage(name: 'cgov:migrate-body-to-ncids cgov_event', description: 'Migrate cgov_event body node to NCIDS format')]
  public function migrateBodyToNcids(string $bundle): void {
    /*
     * Guard against running this command on content types
     * that either do not exist or do not have a body field,
     * otherwise we will just be doing a lot of unnecessary
     * work loading nodes and then skipping them.
     **/
    $node_type = $this->entityTypeManager->getStorage('node_type')->load($bundle);
    if (!$node_type) {
      $this->logger()->error('The content type {node_type} does not exist.', [
        'node_type' => $bundle,
      ]);
      return;
    }

    $field_definitions = $this->entityFieldManager->getFieldDefinitions('node', $bundle);
    if (!isset($field_definitions['body'])) {
      $this->logger()->error('The content type {node_type} does not have a body field.', [
        'node_type' => $bundle,
      ]);
      return;
    }

    /* @todo Check to make sure there are no pages in workflow states other
     * than published. This is harder than one might initially think because
     * moderation state cant be used in entity queries. Oh and the
     * ->latestRevision() filter for entity queries does not really work with
     * translations either.
     */

    // The assumption at this point is that all articles are published. We do
    // have some cases where English is archived, but Spanish is not. Now,
    // we technically will not do any work on nodes that are archived, they
    // show as an error and archived nodes are skipped.
    $nids = $this->entityTypeManager->getStorage('node')
      ->getQuery()
      ->condition('type', $bundle)
      ->accessCheck(FALSE)
      ->execute();

    $batch = [
      'title' => $this->t('Updating HTML in @bundle content items', ['@bundle' => $bundle]),
      'operations' => [],
      'init_message' => $this->t('Initializing'),
      'progress_message' => $this->t('Processed @current out of @total.'),
      'error_message' => $this->t('An error occurred during processing'),
      'progressive' => TRUE,
      'finished' => [static::class, 'batchFinished'],
    ];

    foreach ($nids as $nid) {
      $batch['operations'][] = [
        [static::class, 'processBodyNode'],
        [$nid],
      ];
    }

    $this->logger()->notice('Enqueuing {count} nodes of type {node_type} for migration.', [
      'count' => count($nids),
      'node_type' => $bundle,
    ]);

    batch_set($batch);
    drush_backend_batch_process();
  }

  /**
   * Callback function for batch migration of articles.
   *
   * @param int $nid
   *   The node id.
   * @param array $context
   *   The batch context array, passed by reference.
   */
  public static function processBodyNode($nid, &$context): void {
    if (empty($context['sandbox'])) {
      $context['sandbox']['progress'] = 0;
      $context['sandbox']['max'] = 1;
    }
    if (!isset($context['results']['updated'])) {
      $context['results']['updated'] = 0;
      $context['results']['skipped'] = 0;
      $context['results']['failed'] = 0;
      $context['results']['progress'] = 0;
      $context['results']['process'] = 'Body Node migration batch completed';
    }

    try {
      \Drupal::logger('ncids_migration')->notice('Starting processing for nid: {nid}', ['nid' => $nid]);

      $node = Node::load($nid);

      if (!$node) {
        // This will be caught by the outer try/catch, which logs the nid,
        // so we don't need to include it in the error message.
        throw new \Exception("Node could not be loaded.");
      }

      $transformer_manager = \Drupal::service('ncids_html_transformer.html_transformer_manager');

      // Loop through translations of a node, updating each one and keeping
      // track if updates occurred.
      foreach ($node->getTranslationLanguages() as $language) {
        $langcode = $language->getId();
        try {
          self::processTranslation($langcode, $node, $transformer_manager);
          // Technically archived nodes return FALSE, but we will count them as
          // updated since everywhere else skipping implies an issue.
          $context['results']['updated']++;
        }
        catch (\Exception $e) {
          $context['results']['skipped']++;
          \Drupal::logger('ncids_migration')->warning('Skipping nid: {nid}, language: {lang} due to error: {error}', [
            'nid' => $nid,
            'lang' => $langcode,
            'error' => $e->getMessage(),
          ]);
        }
      }
    }
    catch (\Exception $e) {
      $context['results']['failed']++;
      \Drupal::logger('ncids_migration')->warning('Skipping all translations of nid: {nid} due to error: {error}', [
        'nid' => $nid,
        'error' => $e->getMessage(),
      ]);
    }

    $context['results']['progress']++;
    $context['sandbox']['progress']++;
  }

  /**
   * Process a specific translation of a node.
   *
   * @param string $langcode
   *   The language code.
   * @param \Drupal\node\Entity\Node $node
   *   The node to process.
   * @param \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager $transformer_manager
   *   The transformer service.
   *
   * @return bool
   *   TRUE if content was updated, FALSE otherwise.
   */
  private static function processTranslation(string $langcode, Node $node, NcidsHtmlTransformerManager $transformer_manager): bool {
    \Drupal::logger('ncids_migration')->info('Processing nid: @nid, language: @lang', [
      '@nid' => $node->id(),
      '@lang' => $langcode,
    ]);

    /** @var \Drupal\node\NodeStorage $node_storage */
    $node_storage = \Drupal::entityTypeManager()->getStorage('node');

    // This gets the **latest** revision for the node and this langcode.
    // This will give us something like editing status if there is one,
    // Otherwise the isPublished() check below will not catch nodes that
    // are in editing or other non-published/non-archived states.
    // ----
    // P.S. I am going to assume that we get a revision back since we
    // called this from the list of languages on the node itself.
    $translation_revision_id = $node_storage->getLatestTranslationAffectedRevisionId($node->id(), $langcode);
    /** @var \Drupal\node\Entity\Node $state_revision */
    $state_revision = $node_storage->loadRevision($translation_revision_id);

    // Get the translation to check its current state.
    $state_translation = $state_revision->getTranslation($langcode);

    // Skip archived nodes because we are cool with them.
    if ($state_translation->moderation_state->value === 'archived' && !$state_translation->isPublished()) {
      return FALSE;
    }

    // Since we already checked for archived nodes, that leaves us with stuff
    // that is either in a draft or editing state.
    if ($state_translation->moderation_state->value !== 'published' && !$state_translation->isPublished()) {
      throw new \Exception("Node is not published nid: {$node->id()}, language: {$langcode}");
    }

    // Now load the latest overall revision to get the current paragraphs.
    // If we used the translation-specific revision, we might process older
    // paragraph content or miss paragraphs added after that revision.
    $latest_revision_id = $node_storage->getLatestRevisionId($node->id());
    /** @var \Drupal\node\Entity\Node $latest_revision */
    $latest_revision = $node_storage->loadRevision($latest_revision_id);

    // Get the translation from the latest revision to process.
    $translated_node = $latest_revision->getTranslation($langcode);

    try {
      return self::processNode($translated_node, $transformer_manager);
    }
    catch (\Exception $e) {
      throw new \Exception("Error processing node {$node->id()}, language {$langcode}: " . $e->getMessage());
    }
  }

  /**
   * Process content for a node.
   *
   * @param \Drupal\node\Entity\Node $node
   *   The node to process.
   * @param object $transformer
   *   The transformer service.
   *
   * @return bool
   *   TRUE if content was updated, FALSE otherwise.
   */
  private static function processNode(Node $node, $transformer): bool {

    // Guard against nodes that do not have a body field.
    if (!$node->hasField('body')) {
      \Drupal::logger('ncids_migration')->warning('Skipping nid: {nid}, language: {lang} because it has no body field.', [
        'nid' => $node->id(),
        'lang' => $node->language()->getId(),
      ]);
      return FALSE;
    }

    $field_data = $node->get('body')->getValue();
    $updated = FALSE;

    /* Only process values exist */
    // @todo See if this should not just be a count check.
    if (empty($field_data[0])) {
      return $updated;
    }

    $transformed_content = $transformer->transformAll($field_data[0]['value']);

    $node->set('body', [
      'value' => $transformed_content,
      'format' => 'ncids_full_html',
    ]);
    $node->save();
    $updated = TRUE;

    return $updated;
  }

  /**
   * Batch finished callback.
   *
   * @param bool $success
   *   A boolean indicating whether the batch has completed successfully.
   * @param mixed $results
   *   The value set in $context['results'] by callback_batch_operation().
   * @param mixed $operations
   *   If $success is FALSE, contains the operations that remained unprocessed.
   * @param float $elapsed
   *   The time taken to process the batch.
   */
  public static function batchFinished($success, $results, $operations, $elapsed): void {
    // In Drush batch processing we do not have access to Drush output,
    // nor do we want to junk up the messenger in the UI since whoever
    // sees the messaging will not understand what they are seeing.
    if ($success) {
      // Note, updated and skipped will add up to more than processed because we
      // are processing the translations of each node, but what is queued is the
      // node itself.
      \Drupal::logger('ncids_migration')->notice(
        '{process} processed {count}, skipped {skipped}, updated {updated}, failed {failed} in {elapsed}.',
        [
          'process' => $results['process'],
          'count' => $results['progress'],
          'skipped' => $results['skipped'],
          'updated' => $results['updated'],
          'failed' => $results['failed'],
          'elapsed' => $elapsed,
        ]
      );
    }
    else {
      // An error occurred. $operations contains the operations that remained
      // unprocessed. Pick the last operation and report on what happened.
      // This means something real bad happened since the batch processor
      // handles all possible errors.
      $error_operation = reset($operations);
      if ($error_operation) {
        \Drupal::logger('ncids_migration')->error(
          'An error occurred while processing {error_operation} with arguments: {arguments}',
          [
            'error_operation' => print_r($error_operation[0], TRUE),
            'arguments' => print_r($error_operation[1], TRUE),
          ]
        );
      }
    }
  }

}
