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
      \Drupal::logger('cgov_article')->info('Starting transformation of nid: @nid, language: @lang', [
        '@nid' => $nid,
        '@lang' => $node->language()->getId(),
      ]);
      if (!$node) {
        $context['results']['errors'][] = "Node $nid could not be loaded.";
        return;
      }

      // Check moderation state.
      if ($node->hasField('moderation_state')) {
        $moderation_state = $node->get('moderation_state')->value;
        if ($moderation_state !== 'published') {
          \Drupal::logger('cgov_article')->info('Skipping node @nid - not published (state: @state)', [
            '@nid' => $nid,
            '@state' => $moderation_state,
          ]);
          return;
        }
      }
      elseif (!$node->isPublished()) {
        \Drupal::logger('cgov_article')->info('Node is unpublished nid: @nid', ['@nid' => $nid]);
        return;
      }

      $transformer_manager = \Drupal::service('ncids_html_transformer.html_transformer_manager');

      /* Process main language content */
      $updated = self::processNode($node, $transformer_manager);

      /* Process all available translations */
      foreach ($node->getTranslationLanguages() as $langcode => $language) {
        if ($langcode !== $node->language()->getId()) {
          $translated_node = $node->getTranslation($langcode);
          $updated = self::processNode($translated_node, $transformer_manager) || $updated;
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
  private static function processNode(Node $node, $transformer): bool {
    $article_body = $node->get('field_article_body')->getValue();
    $updated = FALSE;
    $new_paragraphs = [];

    /** @var \Drupal\Core\Entity\RevisionableStorageInterface $paragraph_storage */
    $paragraph_storage = \Drupal::entityTypeManager()->getStorage('paragraph');
    foreach ($article_body as $paragraph_reference) {
      /** @var \Drupal\paragraphs\Entity\Paragraph $old_paragraph */
      $old_paragraph = $paragraph_storage->loadRevision($paragraph_reference['target_revision_id']);

      // $old_paragraph = Paragraph::load($paragraph_reference['target_id']);.
      $field_data = $old_paragraph->get('field_body_section_content')->getValue();
      /* Only process if values exist */
      if (empty($field_data[0])) {
        $new_paragraphs[] = $paragraph_reference;
        continue;
      }
      $original_content = $field_data[0]['value'];
      $format = 'ncids_full_html';

      /* Only process if content exists */
      if (empty($original_content)) {
        $new_paragraphs[] = $paragraph_reference;
        continue;
      }

      $transformed_content = $transformer->transformAll($original_content);

      /* Check if transformation occurred */
      if ($transformed_content !== $original_content) {
        $updated = TRUE;
      }

      /* Create a new paragraph with the transformed content */
      if (empty($old_paragraph->get('field_body_section_heading')->value) || is_null($old_paragraph->get('field_body_section_heading')->value)) {
        $new_paragraph = Paragraph::create([
          'type' => 'body_section',
          'field_body_section_content' => [
            'value' => $transformed_content,
            'format' => $format,
          ],
        ]);
      }
      else {
        $new_paragraph = Paragraph::create([
          'type' => 'body_section',
          'field_body_section_content' => [
            'value' => $transformed_content,
            'format' => $format,
          ],
          'field_body_section_heading' => [
            'value' => $old_paragraph->get('field_body_section_heading')->value,
            'format' => 'simple',
          ],
        ]);
      }
      $new_paragraph->save();

      /* Add the new paragraph to the array */
      $new_paragraphs[] = [
        'target_id' => $new_paragraph->id(),
        'target_revision_id' => $new_paragraph->getRevisionId(),
      ];
    }

    /* Always save the new paragraphs to the node to ensure format is updated */
    $node->set('field_article_body', $new_paragraphs);
    $node->set('moderation_state', 'published');
    $node->setNewRevision(TRUE);
    $node->setRevisionLogMessage('Migrated content to NCIDS format');
    $node->save();

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
