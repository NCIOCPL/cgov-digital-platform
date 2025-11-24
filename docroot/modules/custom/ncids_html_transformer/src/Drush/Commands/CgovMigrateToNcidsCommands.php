<?php

namespace Drupal\ncids_html_transformer\Drush\Commands;

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
   */
  public function __construct(protected EntityTypeManagerInterface $entityTypeManager) {
    parent::__construct();
  }

  /**
   * Update HTML in cgov_article content items.
   */
  #[CLI\Command(name: 'cgov:migrate-article-to-ncids', aliases: ['cgov:m-a-ncids'])]
  #[CLI\Bootstrap(level: DrupalBootLevels::FULL)]
  #[CLI\Usage(name: 'cgov:migrate-article-to-ncids', description: 'Migrate cgov_article content to NCIDS format')]
  public function migrateArticleToNcids() {

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
      ->condition('type', 'cgov_article')
      ->accessCheck(FALSE)
      ->execute();

    $batch = [
      'title' => $this->t('Updating HTML in cgov_article content items'),
      'operations' => [],
      'init_message' => $this->t('Initializing'),
      'progress_message' => $this->t('Processed @current out of @total.'),
      'error_message' => $this->t('An error occurred during processing'),
      'progressive' => TRUE,
      'finished' => [static::class, 'batchFinished'],
    ];

    foreach ($nids as $nid) {
      $batch['operations'][] = [
        [static::class, 'processArticle'],
        [$nid],
      ];
    }

    $this->logger()->notice('Enqueuing {count} nodes of type {node_type} for migration.', [
      'count' => count($nids),
      'node_type' => 'cgov_article',
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
  public static function processArticle($nid, &$context): void {
    if (empty($context['sandbox'])) {
      $context['sandbox']['progress'] = 0;
      $context['sandbox']['max'] = 1;
    }
    if (!isset($context['results']['updated'])) {
      $context['results']['updated'] = 0;
      $context['results']['skipped'] = 0;
      $context['results']['failed'] = 0;
      $context['results']['progress'] = 0;
      $context['results']['process'] = 'Article migration batch completed';
    }

    try {
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
    /** @var \Drupal\node\Entity\Node $loaded_revision */
    $loaded_revision = $node_storage->loadRevision($translation_revision_id);

    // While we loaded the revision at the version for the language, we still
    // need to get the language specific translation object.
    $translated_node = $loaded_revision->getTranslation($langcode);

    // Skip archived nodes because we are cool with them.
    if ($translated_node->moderation_state->value === 'archived' && $translated_node->status->value === "0") {
      return FALSE;
    }

    // Since we already checked for archived nodes, that leaves us with stuff
    // that is either in a draft or editing state.
    if (!$translated_node->isPublished()) {
      throw new \Exception("Node is not published nid: {$node->id()}, language: {$langcode}");
    }

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

    $article_body = $node->get('field_article_body')->getValue();
    $updated = FALSE;

    foreach ($article_body as $paragraph_reference) {
      /** @var \Drupal\Core\Entity\RevisionableStorageInterface $paragraphStorage */
      $paragraphStorage = \Drupal::entityTypeManager()->getStorage('paragraph');
      /** @var \Drupal\paragraphs\Entity\Paragraph $paragraph */
      $paragraph = $paragraphStorage->loadRevision($paragraph_reference['target_revision_id']);

      if (!$paragraph || $paragraph->getType() !== 'body_section') {
        continue;
      }

      $field_data = $paragraph->get('field_body_section_content')->getValue();
      /* Only process values exist */
      // @todo See if this should not just be a count check.
      if (empty($field_data[0])) {
        continue;
      }

      $transformed_content = $transformer->transformAll($field_data[0]['value']);

      $paragraph->set('field_body_section_content', [
        'value' => $transformed_content,
        'format' => 'ncids_full_html',
      ]);
      $paragraph->save();
      $updated = TRUE;
    }

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
        \Drupal::logger('ncids_migration')->error('An error occurred while processing {error_operation} with arguments: {arguments}',
        [
          'error_operation' => print_r($error_operation[0], TRUE),
          'arguments' => print_r($error_operation[1], TRUE),
        ]);
      }
    }
  }

}
