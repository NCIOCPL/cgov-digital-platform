<?php

namespace Drupal\ncids_html_transformer\Drush\Commands;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\TranslatableRevisionableStorageInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Drupal\paragraphs\ParagraphInterface;
use Drush\Attributes as CLI;
use Drush\Boot\DrupalBootLevels;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;

/**
 * A Drush commandfile to migrate Cancer Research pages to Mini Landing Pages.
 */
class CgovCancerResearchToMiniLandingCommands extends DrushCommands {

  use StringTranslationTrait;

  use AutowireTrait;

  /**
   * Source content type bundle.
   */
  private const SOURCE_BUNDLE = 'cgov_cancer_research';

  /**
   * Destination content type bundle.
   */
  private const DESTINATION_BUNDLE = 'cgov_mini_landing';

  /**
   * Pretty URL fallback when the source page is a section landing page.
   */
  private const PRETTY_URL_FALLBACK = 'new';

  /**
   * Suffix to append to the MLP pretty URL to avoid collision during migration.
   */
  private const PRETTY_URL_SUFFIX = '-new';

  /**
   * Fields copied directly from the source node to the destination node.
   */
  private const FIELD_MAP = [
    'title',
    'uid',
    'created',
    'changed',
    'field_browser_title',
    'field_card_title',
    'field_page_description',
    'field_list_description',
    'field_feature_card_description',
    'field_site_section',
    'field_image_promotional',
    'field_date_posted',
    'field_date_updated',
    'field_date_reviewed',
    'field_date_display_mode',
    'field_search_engine_restrictions',
    'field_meta_tags',
  ];

  /**
   * Constructs a new CgovCancerResearchToMiniLandingCommands object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entityTypeManager
   *   The entity type manager.
   * @param \Drupal\Core\Database\Connection $database
   *   The database connection.
   */
  public function __construct(
    protected EntityTypeManagerInterface $entityTypeManager,
    protected Connection $database,
  ) {
    parent::__construct();
  }

  /**
   * Create Mini Landing Pages from all Cancer Research Listing Pages.
   */
  #[CLI\Command(name: 'cgov:migrate-cancer-research-to-mini-landing', aliases: ['cgov:m-cr-mlp'])]
  #[CLI\Bootstrap(level: DrupalBootLevels::FULL)]
  #[CLI\Usage(name: 'cgov:migrate-cancer-research-to-mini-landing', description: 'Create Mini Landing Pages from Cancer Research Listing Pages')]
  public function migrateCancerResearchToMiniLanding(): void {
    if (!$this->bundleExists(self::SOURCE_BUNDLE)) {
      $this->logger()->error('The source content type {node_type} does not exist.', [
        'node_type' => self::SOURCE_BUNDLE,
      ]);
      return;
    }

    if (!$this->bundleExists(self::DESTINATION_BUNDLE)) {
      $this->logger()->error('The destination content type {node_type} does not exist.', [
        'node_type' => self::DESTINATION_BUNDLE,
      ]);
      return;
    }

    $nids = $this->entityTypeManager->getStorage('node')
      ->getQuery()
      ->condition('type', self::SOURCE_BUNDLE)
      ->sort('nid')
      ->accessCheck(FALSE)
      ->execute();

    if (empty($nids)) {
      $this->logger()->warning('No Cancer Research Listing Page nodes were found.');
      return;
    }

    $this->logger()->notice('Found {count} Cancer Research Listing Page nodes for Mini Landing Page migration.', [
      'count' => count($nids),
    ]);

    $batch = [
      'title' => $this->t('Migrating Cancer Research pages to Mini Landing Pages'),
      'operations' => [],
      'init_message' => $this->t('Initializing'),
      'progress_message' => $this->t('Processed @current out of @total.'),
      'error_message' => $this->t('An error occurred during processing'),
      'progressive' => TRUE,
      'finished' => [static::class, 'batchFinished'],
    ];
    foreach ($nids as $nid) {
      $batch['operations'][] = [
        [static::class, 'processNode'],
        [(int) $nid],
      ];
    }

    batch_set($batch);
    drush_backend_batch_process();
  }

  /**
   * Batch callback for migrating one Cancer Research page.
   *
   * @param int $nid
   *   The source node id.
   * @param array $context
   *   The batch context array, passed by reference.
   */
  public static function processNode(int $nid, array &$context): void {
    if (!isset($context['results']['processed'])) {
      $context['results'] = [
        'processed' => 0,
        'created' => 0,
        'translations' => 0,
        'site_sections_updated' => 0,
        'deleted' => 0,
        'failed' => 0,
      ];
    }

    try {
      $command = static::create(\Drupal::getContainer());
      $result = $command->migrateNodeInTransaction($nid);
      $context['results']['created']++;
      $context['results']['translations'] += $result['translations'];
      $context['results']['site_sections_updated'] += $result['site_sections_updated'];
      $context['results']['deleted']++;

      \Drupal::logger('ncids_migration')->notice(
        'Migrated Cancer Research nid: {source_nid} to Mini Landing nid: {destination_nid}.',
        [
          'source_nid' => $nid,
          'destination_nid' => $result['destination_nid'],
        ]
      );
    }
    catch (\Throwable $e) {
      $context['results']['failed']++;
      \Drupal::logger('ncids_migration')->warning(
        'Failed migrating Cancer Research nid: {source_nid}. Error: {error}',
        [
          'source_nid' => $nid,
          'error' => $e->getMessage(),
        ]
      );
    }

    $context['results']['processed']++;
  }

  /**
   * Check whether a node bundle exists.
   *
   * @param string $bundle
   *   The node bundle.
   *
   * @return bool
   *   TRUE when the bundle exists.
   */
  private function bundleExists(string $bundle): bool {
    return (bool) $this->entityTypeManager->getStorage('node_type')->load($bundle);
  }

  /**
   * Migrate one node inside a database transaction.
   *
   * @param int $nid
   *   The source node id.
   *
   * @return array
   *   Migration result data.
   *
   * @throws \Throwable
   *   Re-throws migration failures after rolling back all entity changes.
   */
  public function migrateNodeInTransaction(int $nid): array {
    $transaction = $this->database->startTransaction();

    try {
      return $this->migrateNode($nid);
    }
    catch (\Throwable $e) {
      $transaction->rollBack();
      $this->resetContentEntityCaches();
      throw $e;
    }
  }

  /**
   * Reset content entity caches after a transaction rollback.
   */
  private function resetContentEntityCaches(): void {
    foreach ($this->entityTypeManager->getDefinitions() as $entity_type) {
      if ($entity_type->getGroup() === 'content') {
        $this->entityTypeManager->getStorage($entity_type->id())->resetCache();
      }
    }
  }

  /**
   * Migrate one Cancer Research Listing Page to one Mini Landing Page.
   *
   * @param int $nid
   *   The source node id.
   *
   * @return array
   *   Migration result data.
   *
   * @throws \Exception
   *   Throws when the source node cannot be migrated.
   */
  private function migrateNode(int $nid): array {
    $node_storage = $this->entityTypeManager->getStorage('node');
    if (!$node_storage instanceof TranslatableRevisionableStorageInterface) {
      throw new \RuntimeException('Node storage does not support translatable revisions.');
    }

    $default_source = $node_storage->load($nid);
    $latest_revision_id = $node_storage->getLatestRevisionId($nid);
    $latest_source = $latest_revision_id
      ? $node_storage->loadRevision($latest_revision_id)
      : NULL;
    if (
      !$default_source instanceof NodeInterface ||
      !$latest_source instanceof NodeInterface ||
      $default_source->bundle() !== self::SOURCE_BUNDLE
    ) {
      throw new \Exception('Source node could not be loaded as a Cancer Research Listing Page.');
    }

    $pending_translations = $this->buildPendingTranslationValues(
      $default_source,
      $latest_source,
      $node_storage,
    );

    // Create MLP with temporary pretty URL to avoid collision with CRLP.
    $destination = $this->createDefaultTranslation($default_source, TRUE);

    foreach ($default_source->getTranslationLanguages(FALSE) as $language) {
      $langcode = $language->getId();
      $source_translation = $default_source->getTranslation($langcode);
      $translation_values = $this->buildMiniLandingValues($source_translation, FALSE, TRUE);
      $destination_translation = self::addDestinationTranslation(
        $destination,
        $langcode,
        $translation_values,
      );
      $destination_translation->setNewRevision(TRUE);
      $destination_translation->setRevisionTranslationAffected(TRUE);
      $destination_translation->save();
    }

    // Update site section taxonomy terms that reference this page.
    $site_sections_updated = $this->updateSiteSectionReferences(
      $nid,
      (int) $destination->id(),
    );

    // Delete the source Cancer Research page.
    $latest_source->delete();

    // Update MLP pretty URLs to final values now that CRLP is deleted.
    $destination = $this->updatePrettyUrls($destination, $default_source);

    // Recreate newer translation-specific pending revisions after the
    // destination's published/default revision and final URL are in place.
    $destination = $this->createPendingTranslationRevisions(
      $destination,
      $pending_translations,
    );

    return [
      'destination_nid' => $destination->id(),
      'translations' => count($destination->getTranslationLanguages()),
      'site_sections_updated' => $site_sections_updated,
    ];
  }

  /**
   * Build values for translations with revisions newer than the default one.
   *
   * @param \Drupal\node\NodeInterface $default_source
   *   The source node's default revision.
   * @param \Drupal\node\NodeInterface $latest_source
   *   The source node's latest overall revision.
   * @param \Drupal\Core\Entity\TranslatableRevisionableStorageInterface $node_storage
   *   The node storage.
   *
   * @return array
   *   Pending destination values keyed by language code.
   */
  private function buildPendingTranslationValues(
    NodeInterface $default_source,
    NodeInterface $latest_source,
    TranslatableRevisionableStorageInterface $node_storage,
  ): array {
    $pending_translations = [];
    $default_revision_id = (int) $default_source->getRevisionId();

    foreach ($latest_source->getTranslationLanguages() as $language) {
      $langcode = $language->getId();
      $state_revision_id = $node_storage
        ->getLatestTranslationAffectedRevisionId($latest_source->id(), $langcode);
      if (!$state_revision_id || (int) $state_revision_id === $default_revision_id) {
        continue;
      }

      $state_revision = $node_storage->loadRevision($state_revision_id);
      if (
        !$state_revision instanceof NodeInterface ||
        !$state_revision->hasTranslation($langcode)
      ) {
        throw new \RuntimeException(sprintf(
          'Unable to load the latest %s translation state for nid %s.',
          $langcode,
          $latest_source->id(),
        ));
      }

      if ($state_revision->wasDefaultRevision()) {
        continue;
      }

      // Use the latest overall revision for current field content, but retain
      // the workflow state from this translation's latest affected revision.
      $content_translation = $latest_source->getTranslation($langcode);
      $values = $this->buildMiniLandingValues(
        $content_translation,
        FALSE,
        FALSE,
        TRUE,
      );
      $state_translation = $state_revision->getTranslation($langcode);
      $values = array_replace(
        $values,
        self::getPublicationValues($state_translation),
      );
      $pending_translations[$langcode] = $values;
    }

    return $pending_translations;
  }

  /**
   * Create translation-specific pending revisions on the destination node.
   *
   * @param \Drupal\node\NodeInterface $destination
   *   The destination node with its default revision already created.
   * @param array $pending_translations
   *   Pending translation values keyed by language code.
   *
   * @return \Drupal\node\NodeInterface
   *   The latest destination revision.
   */
  private function createPendingTranslationRevisions(
    NodeInterface $destination,
    array $pending_translations,
  ): NodeInterface {
    $node_storage = $this->entityTypeManager->getStorage('node');
    if (!$node_storage instanceof TranslatableRevisionableStorageInterface) {
      throw new \RuntimeException('Node storage does not support translatable revisions.');
    }

    foreach ($pending_translations as $langcode => $values) {
      $latest_revision_id = $node_storage->getLatestRevisionId($destination->id());
      $latest_destination = $latest_revision_id
        ? $node_storage->loadRevision($latest_revision_id)
        : NULL;
      if (!$latest_destination instanceof NodeInterface) {
        throw new \RuntimeException('Unable to load the latest Mini Landing Page revision.');
      }

      if ($latest_destination->hasTranslation($langcode)) {
        $destination_translation = $latest_destination->getTranslation($langcode);
        foreach ($values as $field_name => $field_value) {
          $destination_translation->set($field_name, $field_value);
        }
        self::applyPublicationValues($destination_translation, $values);
      }
      else {
        $destination_translation = self::addDestinationTranslation(
          $latest_destination,
          $langcode,
          $values,
        );
      }

      $destination_translation->setNewRevision(TRUE);
      $destination_translation->setRevisionTranslationAffected(TRUE);
      $destination_translation->save();
      $destination = $destination_translation->getUntranslated();
    }

    return $destination;
  }

  /**
   * Create the destination node's default translation.
   *
   * @param \Drupal\node\NodeInterface $source
   *   The source node.
   * @param bool $temporary_pretty_url
   *   TRUE to use temporary pretty URL with suffix.
   *
   * @return \Drupal\node\NodeInterface
   *   The created Mini Landing Page.
   */
  private function createDefaultTranslation(NodeInterface $source, bool $temporary_pretty_url = FALSE): NodeInterface {
    $destination = $this->entityTypeManager->getStorage('node')
      ->create($this->buildMiniLandingValues($source, TRUE, $temporary_pretty_url));
    if (!$destination instanceof NodeInterface) {
      throw new \RuntimeException('Mini Landing Page node could not be created.');
    }

    $destination->save();
    return $destination;
  }

  /**
   * Build destination node values from one source node translation.
   *
   * @param \Drupal\node\NodeInterface $source
   *   The source node translation.
   * @param bool $include_bundle
   *   TRUE when creating the destination node's default translation.
   * @param bool $temporary_pretty_url
   *   TRUE to append the temporary suffix to the pretty URL.
   * @param bool $include_empty_fields
   *   TRUE to include empty values when updating an existing translation.
   *
   * @return array
   *   Destination node values.
   */
  private function buildMiniLandingValues(
    NodeInterface $source,
    bool $include_bundle = TRUE,
    bool $temporary_pretty_url = FALSE,
    bool $include_empty_fields = FALSE,
  ): array {
    $values = [];

    if ($include_bundle) {
      $values['type'] = self::DESTINATION_BUNDLE;
      $values['langcode'] = $source->language()->getId();
    }

    foreach (self::FIELD_MAP as $field_name) {
      if ($include_empty_fields && $source->hasField($field_name)) {
        $values[$field_name] = $source->get($field_name)->getValue();
      }
      else {
        self::copyFieldValue($source, $field_name, $values);
      }
    }

    $values += self::getPublicationValues($source);

    $values['field_pretty_url'] = $this->getPrettyUrlValue($source, $temporary_pretty_url);
    $values['field_mlp_page_style'] = [
      [
        'value' => 'ncids_default',
      ],
    ];

    $landing_contents = $this->buildLandingContentsValue($source);
    if (!empty($landing_contents) || $include_empty_fields) {
      $values['field_landing_contents'] = $landing_contents;
    }

    return $values;
  }

  /**
   * Get normalized publication values from one source translation.
   *
   * The moderation state is authoritative when it is available. This also
   * corrects inconsistent YAML content where the moderation state and status
   * field do not agree.
   *
   * @param \Drupal\node\NodeInterface $source
   *   The source node translation.
   *
   * @return array
   *   The normalized status and moderation state.
   */
  private static function getPublicationValues(NodeInterface $source): array {
    $moderation_state = '';
    if ($source->hasField('moderation_state')) {
      $moderation_state = trim($source->get('moderation_state')->getString());
    }

    if ($moderation_state === '') {
      $moderation_state = $source->isPublished() ? 'published' : 'draft';
    }

    return [
      'status' => $moderation_state === 'published' ? 1 : 0,
      'moderation_state' => $moderation_state,
    ];
  }

  /**
   * Add a translation and restore the requested publication state.
   *
   * Content Moderation resets every new translation to the workflow's default
   * state in hook_entity_translation_create(), so the state must be reapplied
   * after addTranslation().
   *
   * @param \Drupal\node\NodeInterface $destination
   *   The destination node.
   * @param string $langcode
   *   The translation language code.
   * @param array $values
   *   The translated field values.
   *
   * @return \Drupal\node\NodeInterface
   *   The new destination translation.
   */
  private static function addDestinationTranslation(
    NodeInterface $destination,
    string $langcode,
    array $values,
  ): NodeInterface {
    $translation = $destination->addTranslation($langcode, $values);
    if (!$translation instanceof NodeInterface) {
      throw new \RuntimeException(sprintf(
        'Unable to create the %s Mini Landing Page translation.',
        $langcode,
      ));
    }

    self::applyPublicationValues($translation, $values);
    return $translation;
  }

  /**
   * Apply normalized publication values to a destination translation.
   *
   * @param \Drupal\node\NodeInterface $translation
   *   The destination node translation.
   * @param array $values
   *   Values containing status and moderation_state.
   */
  private static function applyPublicationValues(
    NodeInterface $translation,
    array $values,
  ): void {
    if (!empty($values['status'])) {
      $translation->setPublished();
    }
    else {
      $translation->setUnpublished();
    }

    // Set moderation_state last because the workflow state controls status.
    $translation->set('moderation_state', $values['moderation_state']);
  }

  /**
   * Copy a field value from source values to destination values.
   *
   * @param \Drupal\node\NodeInterface $source
   *   The source node translation.
   * @param string $field_name
   *   The field name.
   * @param array $values
   *   Destination values.
   */
  private static function copyFieldValue(NodeInterface $source, string $field_name, array &$values): void {
    if (!$source->hasField($field_name) || $source->get($field_name)->isEmpty()) {
      return;
    }

    $values[$field_name] = $source->get($field_name)->getValue();
  }

  /**
   * Get the destination pretty URL value.
   *
   * @param \Drupal\node\NodeInterface $source
   *   The source node translation.
   * @param bool $temporary
   *   TRUE to append the temporary suffix to avoid collision.
   *
   * @return array
   *   Pretty URL field value, or an empty array for a final section landing
   *   page URL.
   */
  private function getPrettyUrlValue(NodeInterface $source, bool $temporary = FALSE): array {
    $pretty_url = '';

    if (
      $source->hasField('field_pretty_url') &&
      !$source->get('field_pretty_url')->isEmpty() &&
      trim((string) $source->get('field_pretty_url')->value) !== ''
    ) {
      $pretty_url = $source->get('field_pretty_url')->value;
    }

    if ($temporary) {
      if ($pretty_url === '') {
        $pretty_url = self::PRETTY_URL_FALLBACK;
      }
      $pretty_url .= self::PRETTY_URL_SUFFIX;
    }

    return $pretty_url === ''
      ? []
      : [['value' => $pretty_url]];
  }

  /**
   * Update the pretty URLs on all translations to their final values.
   *
   * @param \Drupal\node\NodeInterface $destination
   *   The destination MLP node.
   * @param \Drupal\node\NodeInterface $default_source
   *   The source CRLP default revision.
   *
   * @return \Drupal\node\NodeInterface
   *   The updated destination node.
   */
  private function updatePrettyUrls(NodeInterface $destination, NodeInterface $default_source): NodeInterface {
    $node_storage = $this->entityTypeManager->getStorage('node');
    if (!$node_storage instanceof TranslatableRevisionableStorageInterface) {
      throw new \RuntimeException('Node storage does not support translatable revisions.');
    }

    // Reload to get the latest state.
    $latest_revision_id = $node_storage->getLatestRevisionId($destination->id());
    $destination = $latest_revision_id
      ? $node_storage->loadRevision($latest_revision_id)
      : NULL;
    if (!$destination instanceof NodeInterface) {
      throw new \RuntimeException('Unable to reload destination MLP.');
    }

    // Update the default translation.
    $final_url = $this->getPrettyUrlValue($default_source, FALSE);
    $destination->set('field_pretty_url', $final_url);
    $destination->setNewRevision(TRUE);
    $destination->setRevisionTranslationAffected(TRUE);
    $destination->save();

    // Update all other translations.
    foreach ($default_source->getTranslationLanguages(FALSE) as $language) {
      $langcode = $language->getId();
      if (!$destination->hasTranslation($langcode)) {
        continue;
      }

      $source_translation = $default_source->getTranslation($langcode);
      $destination_translation = $destination->getTranslation($langcode);
      $final_url = $this->getPrettyUrlValue($source_translation, FALSE);
      $destination_translation->set('field_pretty_url', $final_url);
      $destination_translation->setNewRevision(TRUE);
      $destination_translation->setRevisionTranslationAffected(TRUE);
      $destination_translation->save();
      $destination = $destination_translation->getUntranslated();
    }

    return $destination;
  }

  /**
   * Build the destination landing contents value.
   *
   * @param \Drupal\node\NodeInterface $source
   *   The source node translation.
   *
   * @return array
   *   Landing contents field value.
   */
  private function buildLandingContentsValue(NodeInterface $source): array {
    if (!$source->hasField('field_selected_research') || $source->get('field_selected_research')->isEmpty()) {
      return [];
    }

    $list_items = [];
    $langcode = $source->language()->getId();
    foreach ($source->get('field_selected_research') as $item) {
      $paragraph = $item->get('entity')->getValue();
      if (!$paragraph instanceof ParagraphInterface) {
        continue;
      }

      $paragraph = self::getParagraphForLanguage($paragraph, $langcode);
      $list_items[] = [
        'entity' => $this->duplicateParagraph($paragraph, $langcode),
      ];
    }

    if (empty($list_items)) {
      return [];
    }

    $list = Paragraph::create([
      'type' => 'cgov_list',
      'langcode' => $langcode,
      'field_list_item_style' => [
        [
          'value' => 'ncids_list_item_title_desc_date',
        ],
      ],
      'field_list_items' => $list_items,
    ]);

    return [
      [
        'entity' => $list,
      ],
    ];
  }

  /**
   * Get paragraph content that belongs to the requested language.
   *
   * A translated node can contain default-language paragraph references.
   * Prefer a paragraph translation when available, otherwise retain the
   * paragraph referenced by the active source node translation.
   *
   * @param \Drupal\paragraphs\ParagraphInterface $paragraph
   *   The selected research paragraph.
   * @param string $langcode
   *   The active source translation language.
   *
   * @return \Drupal\paragraphs\ParagraphInterface
   *   Paragraph content for the requested source translation.
   */
  private static function getParagraphForLanguage(
    ParagraphInterface $paragraph,
    string $langcode,
  ): ParagraphInterface {
    if ($paragraph->language()->getId() === $langcode) {
      return $paragraph;
    }

    if (!$paragraph->hasTranslation($langcode)) {
      return $paragraph;
    }

    $translation = $paragraph->getTranslation($langcode);
    return $translation instanceof ParagraphInterface
      ? $translation
      : $paragraph;
  }

  /**
   * Duplicate a paragraph and reset parent metadata before reattaching it.
   *
   * @param \Drupal\paragraphs\ParagraphInterface $paragraph
   *   The source paragraph.
   * @param string $langcode
   *   The active source translation language.
   *
   * @return \Drupal\paragraphs\ParagraphInterface
   *   The paragraph duplicate.
   */
  private function duplicateParagraph(ParagraphInterface $paragraph, string $langcode): ParagraphInterface {
    $duplicate = $paragraph->createDuplicate();
    if (!$duplicate instanceof ParagraphInterface) {
      throw new \RuntimeException('Selected research paragraph could not be duplicated.');
    }

    if ($duplicate->hasField('langcode')) {
      $duplicate->set('langcode', $langcode);
    }

    foreach (['parent_id', 'parent_type', 'parent_field_name'] as $field_name) {
      if ($duplicate->hasField($field_name)) {
        $duplicate->set($field_name, NULL);
      }
    }

    return $duplicate;
  }

  /**
   * Update site section taxonomy terms that reference the source node.
   *
   * @param int $source_nid
   *   The source Cancer Research page node id.
   * @param int $destination_nid
   *   The destination Mini Landing Page node id.
   *
   * @return int
   *   Number of site section terms updated.
   */
  private function updateSiteSectionReferences(int $source_nid, int $destination_nid): int {
    $term_storage = $this->entityTypeManager->getStorage('taxonomy_term');
    $tids = $term_storage->getQuery()
      ->condition('vid', 'cgov_site_sections')
      ->condition('field_landing_page.target_id', $source_nid)
      ->accessCheck(FALSE)
      ->execute();

    $updated_count = 0;
    foreach ($tids as $tid) {
      $term = $term_storage->load($tid);
      if (!$term instanceof ContentEntityInterface) {
        throw new \RuntimeException(sprintf(
          'Unable to load site section taxonomy term %s.',
          $tid,
        ));
      }

      // field_landing_page is not translatable, so one entity save updates it
      // for every translation of the term.
      $term->set('field_landing_page', ['target_id' => $destination_nid]);
      $term->save();
      $updated_count++;
    }

    return $updated_count;
  }

  /**
   * Batch finished callback.
   *
   * @param bool $success
   *   TRUE when the batch completed successfully.
   * @param array $results
   *   Aggregated migration results.
   * @param array $operations
   *   Operations that remained when the batch failed.
   * @param float $elapsed
   *   The elapsed processing time.
   */
  public static function batchFinished($success, $results, $operations, $elapsed): void {
    if ($success) {
      \Drupal::logger('ncids_migration')->notice(
        'Cancer Research to Mini Landing migration completed: processed {processed}, created {created}, translations {translations}, site sections updated {site_sections}, source nodes deleted {deleted}, failed {failed} in {elapsed}.',
        [
          'processed' => $results['processed'] ?? 0,
          'created' => $results['created'] ?? 0,
          'translations' => $results['translations'] ?? 0,
          'site_sections' => $results['site_sections_updated'] ?? 0,
          'deleted' => $results['deleted'] ?? 0,
          'failed' => $results['failed'] ?? 0,
          'elapsed' => $elapsed,
        ]
      );
      return;
    }

    $error_operation = reset($operations);
    \Drupal::logger('ncids_migration')->error(
      'Cancer Research to Mini Landing batch failed. Operation: {operation}; arguments: {arguments}',
      [
        'operation' => $error_operation
          ? print_r($error_operation[0], TRUE)
          : 'unknown',
        'arguments' => $error_operation
          ? print_r($error_operation[1], TRUE)
          : 'unknown',
      ]
    );
  }

}
