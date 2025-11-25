<?php

namespace Drupal\ncids_html_transformer\Drush\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drush\Attributes as CLI;
use Drush\Boot\DrupalBootLevels;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * A Drush commandfile to publish content by bundle.
 */
class CgovPublishBundleCommands extends DrushCommands {

  use StringTranslationTrait;

  use AutowireTrait;

  /**
   * Constructs a new PublishBundleCommands object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   */
  public function __construct(protected EntityTypeManagerInterface $entityTypeManager) {
    parent::__construct();
  }

  /**
   * Publish all nodes of a specific bundle.
   *
   * @param string $bundle
   *   The content type/bundle machine name (e.g., cgov_article).
   */
  #[CLI\Command(name: 'cgov:publish-bundle', aliases: ['cgov:pub-bundle'])]
  #[CLI\Argument(name: 'bundle', description: 'The content type machine name')]
  #[CLI\Bootstrap(level: DrupalBootLevels::FULL)]
  #[CLI\Usage(name: 'cgov:publish-bundle cgov_article', description: 'Publish all cgov_article nodes')]
  public function publishBundle(string $bundle) {
    // Verify the bundle exists.
    $node_types = $this->entityTypeManager->getStorage('node_type')->loadMultiple();
    if (!isset($node_types[$bundle])) {
      $this->logger()->error("Content type '{$bundle}' does not exist.");
      return;
    }

    // Query for all nodes of this bundle (published and unpublished).
    $nids = $this->entityTypeManager->getStorage('node')
      ->getQuery()
      ->condition('type', $bundle)
      ->accessCheck(FALSE)
      ->execute();

    if (empty($nids)) {
      $this->logger()->warning("No nodes found for bundle '{$bundle}'.");
      return;
    }

    $batch = [
      'title' => $this->t('Publishing @bundle nodes', ['@bundle' => $bundle]),
      'operations' => [],
      'init_message' => $this->t('Initializing'),
      'progress_message' => $this->t('Processed @current out of @total.'),
      'error_message' => $this->t('An error occurred during processing'),
      'progressive' => TRUE,
      'finished' => [static::class, 'batchFinished'],
    ];

    foreach ($nids as $nid) {
      $batch['operations'][] = [
        [static::class, 'publishNode'],
        [$nid, $bundle],
      ];
    }

    $this->logger()->notice('Enqueuing {count} nodes of type {node_type} for publishing.', [
      'count' => count($nids),
      'node_type' => $bundle,
    ]);

    batch_set($batch);
    drush_backend_batch_process();
  }

  /**
   * Callback function for batch publishing of nodes.
   *
   * @param int $nid
   *   The node id.
   * @param string $bundle
   *   The content bundle name.
   * @param array $context
   *   The batch context array, passed by reference.
   */
  public static function publishNode($nid, $bundle, &$context): void {
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
      \Drupal::logger('publish_bundle')->info('Processing node @nid', ['@nid' => $nid]);

      $node = Node::load($nid);

      if (!$node) {
        // This will be caught by the outer try/catch, which logs the nid,
        // so we don't need to include it in the error message.
        throw new \Exception("Node could not be loaded.");
      }

      // Process all translations including the original.
      foreach ($node->getTranslationLanguages() as $language) {
        $langcode = $language->getId();
        try {
          $was_published = self::publishTranslation($langcode, $node);
          if ($was_published) {
            $context['results']['updated']++;
          }
          else {
            $context['results']['skipped']++;
          }
        }
        catch (\Exception $e) {
          $context['results']['failed']++;
          \Drupal::logger('publish_bundle')->warning('Skipping nid: {nid}, language: {lang} due to error: {error}', [
            'nid' => $nid,
            'lang' => $langcode,
            'error' => $e->getMessage(),
          ]);
        }
      }
    }
    catch (\Exception $e) {
      $context['results']['failed']++;
      \Drupal::logger('publish_bundle')->warning('Skipping all translations of nid: {nid} due to error: {error}', [
        'nid' => $nid,
        'error' => $e->getMessage(),
      ]);
    }

    $context['results']['progress']++;
    $context['sandbox']['progress']++;
  }

  /**
   * Publish a specific translation of a node.
   *
   * @param string $langcode
   *   The language code of the translation to publish.
   * @param \Drupal\node\Entity\Node $node
   *   The node entity.
   *
   * @return bool
   *   TRUE if the translation was published, FALSE if it was already published.
   *
   * @throws \Exception
   *   Throws exception on errors during publishing.
   */
  private static function publishTranslation(string $langcode, Node $node): bool {

    \Drupal::logger('publish_bundle')->info('Processing nid: @nid, language: @lang', [
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

    // We have a weird thing in YAML content that I think is just YAML junk,
    // but there a piece of content that is in the published state, but the
    // status field is 0 (unpublished). So we are going to check both here.
    $state = $translated_node->get('moderation_state')->value;

    if ($state === 'archived' && !$translated_node->isPublished()) {
      // Archived content that is unpublished should not be published.
      return FALSE;
    }

    if ($state === 'published' && $translated_node->isPublished()) {
      // Already published, nothing to do.
      return FALSE;
    }

    if ($state === 'archived' && $translated_node->isPublished()) {
      // Archived content that is published should not be published again.
      $translated_node->status->value = "0";
    }
    elseif ($state === 'published' && !$translated_node->isPublished()) {
      // This one is an odd case, the moderation state is published, but the
      // status is unpublished. We will just set the status to be published.
      \Drupal::logger('publish_bundle')->notice('Processing Published/Status 0 nid: @nid, language: @lang', [
        '@nid' => $node->id(),
        '@lang' => $langcode,
      ]);

      $translated_node->setPublished();
    }
    else {
      $translated_node->status->value = "1";
      $translated_node->set('moderation_state', 'published');
    }

    try {
      // Tell Drupal that the new revision applies to this translation.
      $translated_node->setRevisionTranslationAffected(TRUE);
      $translated_node->save();
      return TRUE;
    }
    catch (\Exception $e) {
      throw new \Exception("Error processing node {$node->id()}, language {$langcode}: " . $e->getMessage());
    }
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
