<?php

namespace Drush\Commands\cgov;

use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\Entity\Node;
use Drupal\paragraphs\Entity\Paragraph;
use Drush\Commands\DrushCommands;
use Drush\Drush;

/**
 * A Drush commandfile to migrate cgov articles to NCIDS.
 */
class CgovMigrateToNcidsCommands extends DrushCommands {

  use StringTranslationTrait;

  /**
   * Update HTML in cgov_article content items.
   *
   * @command cgov:migrate-article-to-ncids
   * @bootstrap full
   */
  public function migrateArticleToNcids() {
    /* Queries for published article pages */
    $nids = \Drupal::entityQuery('node')
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

      $transformer_manager = \Drupal::service('cgov_core.html_transformer_manager');

      /* Process main language content */
      $updated = static::processNodeContent($node, $transformer_manager) || FALSE;

      /* Process all available translations */
      foreach ($node->getTranslationLanguages() as $langcode => $language) {
        if ($langcode !== $node->language()->getId()) {
          $translated_node = $node->getTranslation($langcode);
          $updated = static::processNodeContent($translated_node, $transformer_manager) || $updated;
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

      $field_data = $paragraph->get('field_body_section_content');
      $original_content = $field_data->value;
      $format = $field_data->format;

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
    $report .= "Updated nodes: " . count($results['updated'] ?? []) . "\n";

    if (!empty($results['errors'])) {
      $report .= "Errors: " . count($results['errors']) . "\n";
      foreach ($results['errors'] as $error) {
        $report .= $error . "\n";
      }
    }
    Drush::output()->writeln($report);
  }

}
