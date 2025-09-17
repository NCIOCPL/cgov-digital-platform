<?php

namespace Drupal\ncids_html_transformer\Drush\Commands;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use Drush\Attributes as CLI;
use Drush\Boot\DrupalBootLevels;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Drush\Drush;

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
    /* Queries for published article pages */
    $nids = $this->entityTypeManager->getStorage('node')
      ->getQuery()
      ->condition('type', 'cgov_article')
      ->condition('status', 1)
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

    try {
      $node = Node::load($nid);
      if (!$node) {
        $context['results']['errors'][] = "Node $nid could not be loaded.";
        return;
      }

      if (!$node->isPublished()) {
        return;
      }

      $transformer_manager = \Drupal::service('ncids_html_transformer.html_transformer_manager');

      /* Process main language content */
      $updated = self::processNodeContent($node, $transformer_manager);

      /* Process all available translations */
      foreach ($node->getTranslationLanguages() as $langcode => $language) {
        if ($langcode !== $node->language()->getId()) {
          $translated_node = $node->getTranslation($langcode);
          $updated = self::processNodeContent($translated_node, $transformer_manager) || $updated;
        }
      }

      if ($updated) {
        $context['results']['updated'][] = $nid;
      }
    }
    catch (\Exception $e) {
      $context['results']['errors'][] = "Error processing node $nid: " . $e->getMessage();
    }

    $context['sandbox']['progress']++;
    $context['finished'] = ($context['sandbox']['progress'] == $context['sandbox']['max']);
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
  private static function processNodeContent(Node $node, $transformer): bool {
    $article_body = $node->get('field_article_body')->getValue();
    $updated = FALSE;

    foreach ($article_body as $paragraph_reference) {
      $paragraph = Paragraph::load($paragraph_reference['target_id']);

      if (!$paragraph || $paragraph->getType() !== 'body_section') {
        continue;
      }

      $field_data = $paragraph->get('field_body_section_content')->getValue();
      /* Only process values exist */
      if (empty($field_data[0])) {
        continue;
      }
      $original_content = $field_data[0]['value'];
      $format = $field_data[0]['format'];

      /* Only process if content exists */
      if (empty($original_content)) {
        continue;
      }

      $transformed_content = $transformer->transformAll($original_content);

      /* Only save if content actually changed */
      if ($transformed_content !== $original_content) {
        $paragraph->set('field_body_section_content', [
          'value' => $transformed_content,
          'format' => $format,
        ]);
        $paragraph->save();
        $updated = TRUE;
      }
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
   */
  public static function batchFinished($success, $results, $operations): void {
    $report = "Report:\n";
    $updatedNodes = (isset($results['updated']) && is_array($results['updated'])) ? $results['updated'] : [];
    $report .= "Updated nodes: " . count($updatedNodes) . "\n";

    if (!empty($results['errors'])) {
      $report .= "Errors: " . count($results['errors']) . "\n";
      foreach ($results['errors'] as $error) {
        $report .= $error . "\n";
      }
    }
    Drush::output()->writeln($report);
  }

}
