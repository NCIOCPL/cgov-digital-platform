<?php

namespace Drupal\ncids_html_transformer\Drush\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drush\Attributes as CLI;
use Drush\Boot\DrupalBootLevels;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Drush\Drush;

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
      ->condition('status', 0)
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

    try {
      \Drupal::logger($bundle)->info('Processing node @nid', ['@nid' => $nid]);

      $node = Node::load($nid);
      if (!$node) {
        $context['results']['errors'][] = "Node $nid could not be loaded.";
        return;
      }

      $was_published = FALSE;

      // Process all translations including the original.
      foreach ($node->getTranslationLanguages() as $langcode => $language) {
        $translated_node = $node->getTranslation($langcode);
        if (!$translated_node->isPublished()) {
          $translated_node->setPublished();
          $translated_node->set('moderation_state', 'published');
          $translated_node->save();
          $was_published = TRUE;
        }
      }

      if ($was_published) {
        $context['results']['published'][] = $nid;
      }
      else {
        $context['results']['already_published'][] = $nid;
      }
    }
    catch (\Exception $e) {
      $context['results']['errors'][] = "Error publishing node $nid: " . $e->getMessage();
    }

    $context['sandbox']['progress']++;
    $context['finished'] = ($context['sandbox']['progress'] == $context['sandbox']['max']);
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
   */
  public static function batchFinished($success, $results, $operations): void {
    $report = "Report:\n";

    $publishedNodes = (isset($results['published']) && is_array($results['published'])) ? $results['published'] : [];
    $alreadyPublished = (isset($results['already_published']) && is_array($results['already_published'])) ? $results['already_published'] : [];

    $report .= "Newly published nodes: " . count($publishedNodes) . "\n";
    $report .= "Already published nodes: " . count($alreadyPublished) . "\n";

    if (!empty($results['errors'])) {
      $report .= "Errors: " . count($results['errors']) . "\n";
      foreach ($results['errors'] as $error) {
        $report .= $error . "\n";
      }
    }

    Drush::output()->writeln($report);
  }

}
