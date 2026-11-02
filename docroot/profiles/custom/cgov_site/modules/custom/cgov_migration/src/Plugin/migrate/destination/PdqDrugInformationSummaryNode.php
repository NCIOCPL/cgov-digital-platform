<?php

namespace Drupal\cgov_migration\Plugin\migrate\destination;

use Drupal\Core\Database\Connection;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\migrate\MigrateException;
use Drupal\migrate\Plugin\migrate\destination\DestinationBase;
use Drupal\migrate\Plugin\MigrateIdMapInterface;
use Drupal\migrate\Plugin\MigrationInterface;
use Drupal\migrate\Row;
use Drupal\node\NodeInterface;
use Drupal\paragraphs\Entity\Paragraph;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Creates or updates a PDQ DIS node and its paragraph fields.
 *
 * @MigrateDestination(
 *   id = "pdq_dis_node",
 *   destination_module = "pdq_drug_information_summary"
 * )
 */
class PdqDrugInformationSummaryNode extends DestinationBase implements ContainerFactoryPluginInterface {

  /**
   * The user ID of the PDQ importer account.
   */
  private ?int $pdqImporterUid = NULL;

  /**
   * {@inheritdoc}
   */
  protected $supportsRollback = TRUE;

  /**
   * Constructs the destination plugin.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    MigrationInterface $migration,
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly Connection $database,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $migration);
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition, ?MigrationInterface $migration = NULL) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $migration,
      $container->get('entity_type.manager'),
      $container->get('database')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return [
      'cdr_id' => 'CDR ID used to find the existing node',
      'title' => 'Page title',
      'browser_title' => 'Browser title',
      'description' => 'Meta description',
      'site_section_path' => 'Computed path of the parent site section',
      'pretty_url' => 'Pretty URL value',
      'pronunciation' => 'Pronunciation key',
      'audio_id' => 'Pronunciation audio ID',
      'intro_text' => 'Intro text HTML',
      'drug_info_type' => 'single or combo',
      'us_brand_names' => 'US brand names for a single drug',
      'drugs_in_combination' => 'Combination-drug list HTML',
      'fda_url' => 'FDA label URL',
      'body_sections' => 'Body-section paragraph values',
      'related_resources' => 'Related-resource paragraph values',
      'posted_date' => 'Posted date',
      'updated_date' => 'Updated date',
      'reviewed_date' => 'Migration execution date',
      'date_display_mode' => 'Dates selected for display',
      'public_use' => 'Public-use flag',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getIds(): array {
    return [
      'nid' => [
        'type' => 'integer',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function import(Row $row, array $old_destination_id_values = []): array {
    $cdr_id = (int) $row->getDestinationProperty('cdr_id');
    $node_storage = $this->entityTypeManager->getStorage('node');
    $nids = array_values($node_storage->getQuery()
      ->condition('type', 'pdq_drug_information_summary')
      ->condition('field_pdq_cdr_id', $cdr_id)
      ->accessCheck(FALSE)
      ->execute());
    if (count($nids) > 1) {
      throw new MigrateException(sprintf(
        'CDR%d matched %d PDQ DIS nodes; at most one existing node is allowed.',
        $cdr_id,
        count($nids)
      ));
    }

    $is_new = count($nids) === 0;
    if ($is_new) {
      /** @var \Drupal\node\NodeInterface $node */
      $node = $node_storage->create([
        'type' => 'pdq_drug_information_summary',
        'langcode' => 'en',
        'uid' => $this->getPdqImporterUid(),
        'status' => 1,
        'moderation_state' => 'published',
      ]);
    }
    else {
      $nid = (int) reset($nids);
      $revision_id = $node_storage->getLatestRevisionId($nid);
      /** @var \Drupal\node\NodeInterface|null $node */
      $node = $node_storage->loadRevision($revision_id);
      if (!$node instanceof NodeInterface) {
        throw new MigrateException("Unable to load the latest revision of node $nid for CDR$cdr_id.");
      }
    }

    $site_section_path = (string) $row->getDestinationProperty('site_section_path');
    $site_sections = $this->entityTypeManager->getStorage('taxonomy_term')
      ->loadByProperties([
        'vid' => 'cgov_site_sections',
        'computed_path' => $site_section_path,
        'langcode' => $node->language()->getId(),
      ]);
    if (count($site_sections) !== 1) {
      throw new MigrateException(sprintf(
        "Site section '%s' matched %d terms for CDR%d.",
        $site_section_path,
        count($site_sections),
        $cdr_id
      ));
    }
    $site_section = reset($site_sections);

    $transaction = $this->database->startTransaction();
    try {
      $node->setTitle((string) $row->getDestinationProperty('title'));
      $node->set('field_browser_title', $row->getDestinationProperty('browser_title'));
      $node->set('field_page_description', $row->getDestinationProperty('description'));
      $node->set('field_pdq_cdr_id', $cdr_id);
      $node->set('field_site_section', $site_section->id());
      $node->set('field_pretty_url', $row->getDestinationProperty('pretty_url'));
      $node->set('field_pdq_pronunciation_key', $row->getDestinationProperty('pronunciation') ?: NULL);
      $node->set('field_pdq_audio_id', $row->getDestinationProperty('audio_id') ?: NULL);
      $node->set('field_intro_text', [
        'value' => $row->getDestinationProperty('intro_text'),
        'format' => 'simple',
      ]);
      $drug_info_type = (string) $row->getDestinationProperty('drug_info_type');
      $node->set('field_drug_info_type', $drug_info_type);
      if ($drug_info_type === 'combo') {
        $drugs_in_combination = (string) $row->getDestinationProperty('drugs_in_combination');
        $node->set('field_us_brand_name', NULL);
        $node->set('field_fda_drug_label_url', NULL);
        $node->set('field_drugs_in_combination', $drugs_in_combination === '' ? NULL : [
          'value' => $drugs_in_combination,
          'format' => 'ncids_streamlined_no_headings',
        ]);
      }
      else {
        $brand_names = array_map(
          static fn(string $name): array => ['value' => $name],
          $row->getDestinationProperty('us_brand_names') ?? []
        );
        $fda_url = (string) $row->getDestinationProperty('fda_url');
        $node->set('field_us_brand_name', $brand_names);
        $node->set('field_fda_drug_label_url', $fda_url === '' ? NULL : ['uri' => $fda_url]);
        $node->set('field_drugs_in_combination', NULL);
      }
      $node->set('field_date_posted', $row->getDestinationProperty('posted_date'));
      $node->set('field_date_updated', $row->getDestinationProperty('updated_date'));
      $node->set('field_date_reviewed', $row->getDestinationProperty('reviewed_date'));
      $node->set('field_date_display_mode', $row->getDestinationProperty('date_display_mode'));
      $node->set('field_public_use', (int) $row->getDestinationProperty('public_use'));
      $node->set('field_article_body', $this->createBodySections(
        $row->getDestinationProperty('body_sections') ?? []
      ));
      $node->set('field_related_resources', $this->createRelatedResources(
        $row->getDestinationProperty('related_resources') ?? []
      ));

      $node->setNewRevision(TRUE);
      $node->setRevisionLogMessage($is_new
        ? 'Created PDQ DIS page from XML with NCIDS fields.'
        : 'Migrated PDQ DIS XML to NCIDS fields.');
      $node->save();
    }
    catch (\Throwable $e) {
      $transaction->rollBack();
      throw new MigrateException("Unable to migrate CDR$cdr_id: {$e->getMessage()}", 0, $e);
    }
    unset($transaction);

    $nid = (int) $node->id();
    // Recovery is performed from a database backup. Never delete PDQ nodes
    // through Migrate API rollback, regardless of whether this import created
    // or updated them.
    $this->setRollbackAction($row->getIdMap(), MigrateIdMapInterface::ROLLBACK_PRESERVE);
    $node_storage->resetCache([$nid]);
    return [$nid];
  }

  /**
   * Gets the PDQ importer user ID used as the owner of newly created nodes.
   */
  private function getPdqImporterUid(): int {
    if ($this->pdqImporterUid !== NULL) {
      return $this->pdqImporterUid;
    }

    $users = $this->entityTypeManager->getStorage('user')->loadByProperties([
      'name' => 'PDQ',
      'status' => 1,
    ]);
    if (count($users) !== 1) {
      throw new MigrateException(sprintf(
        'Expected exactly one active PDQ importer user; found %d.',
        count($users)
      ));
    }

    $this->pdqImporterUid = (int) reset($users)->id();
    return $this->pdqImporterUid;
  }

  /**
   * Creates unsaved body-section paragraphs for the node save cascade.
   */
  private function createBodySections(array $sections): array {
    $paragraphs = [];
    foreach ($sections as $section) {
      $paragraphs[] = Paragraph::create([
        'type' => 'body_section',
        'field_body_section_heading' => [
          'value' => $section['heading'] ?? '',
          'format' => 'simple',
        ],
        'field_body_section_content' => [
          'value' => $section['content'] ?? '',
          'format' => 'ncids_full_html',
        ],
      ]);
    }
    return $paragraphs;
  }

  /**
   * Creates unsaved external-link paragraphs for the node save cascade.
   */
  private function createRelatedResources(array $resources): array {
    $paragraphs = [];
    foreach ($resources as $resource) {
      $paragraphs[] = Paragraph::create([
        'type' => 'cgov_external_link',
        'field_override_title' => $resource['title'] ?? '',
        'field_external_link' => [
          'uri' => $resource['url'] ?? '',
        ],
      ]);
    }
    return $paragraphs;
  }

}
