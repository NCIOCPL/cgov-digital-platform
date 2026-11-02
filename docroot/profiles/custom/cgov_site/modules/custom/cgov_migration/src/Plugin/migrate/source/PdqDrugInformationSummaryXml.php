<?php

namespace Drupal\cgov_migration\Plugin\migrate\source;

use Drupal\cgov_migration\DrugSummaryXmlParser;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Site\Settings;
use Drupal\migrate\MigrateException;
use Drupal\migrate\Plugin\migrate\source\SourcePluginBase;
use Drupal\migrate\Plugin\MigrationInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Reads PDQ Drug Information Summary XML files from a directory.
 *
 * @MigrateSource(
 *   id = "pdq_dis_xml",
 *   source_module = "cgov_migration"
 * )
 */
class PdqDrugInformationSummaryXml extends SourcePluginBase implements ContainerFactoryPluginInterface {

  /**
   * Absolute source directory.
   */
  private string $directory;

  /**
   * Constructs the source plugin.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    MigrationInterface $migration,
    private readonly DrugSummaryXmlParser $parser,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $migration);
    $configured = $configuration['directory']
      ?? Settings::get('pdq_dis_xml_directory')
      ?? getenv('PDQ_DIS_XML_DIR');
    $directory = is_string($configured) ? realpath($configured) : FALSE;
    if (!$directory || !is_dir($directory) || !is_readable($directory)) {
      throw new MigrateException(
        'Set PDQ_DIS_XML_DIR or $settings[\'pdq_dis_xml_directory\'] to a readable content/en XML directory.'
      );
    }
    $this->directory = $directory;
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
      $container->get('cgov_migration.xml_parser')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function fields(): array {
    return [
      'cdr_id' => 'Numeric CDR document ID',
      'title' => 'Drug information summary title',
      'description' => 'Meta description',
      'site_section_path' => 'Parent site-section path',
      'pretty_url' => 'Final URL path component',
      'pronunciation' => 'Pronunciation key',
      'audio_id' => 'English pronunciation audio CDR ID',
      'intro_text' => 'NCIDS intro HTML',
      'drug_info_type' => 'single or combo',
      'us_brand_names' => 'US brand names for a single drug',
      'drugs_in_combination' => 'NCIDS combination-drug list HTML',
      'fda_url' => 'DailyMed URL for a single drug',
      'body_sections' => 'Body-section paragraph values',
      'related_resources' => 'Related-resource paragraph values',
      'posted_date' => 'First published date',
      'updated_date' => 'Last modified date',
      'date_display_mode' => 'Enabled date display values',
      'public_use' => 'Public-use flag',
      'source_file' => 'Source XML filename',
    ];
  }

  /**
   * {@inheritdoc}
   */
  protected function initializeIterator(): \Iterator {
    $files = glob($this->directory . '/*.xml') ?: [];
    sort($files, SORT_NATURAL);
    if (!$files) {
      throw new MigrateException("No XML files found in {$this->directory}.");
    }

    foreach ($files as $file) {
      try {
        $values = $this->parser->parseFile($file);
      }
      catch (\InvalidArgumentException $e) {
        throw new MigrateException($e->getMessage(), 0, $e);
      }
      $filename_id = (int) pathinfo($file, PATHINFO_FILENAME);
      if ($filename_id !== (int) $values['cdr_id']) {
        throw new MigrateException(sprintf(
          '%s contains CDR%s; the filename and document ID must match.',
          basename($file),
          $values['cdr_id']
        ));
      }
      $values['source_file'] = basename($file);
      yield $values;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getIds(): array {
    return [
      'cdr_id' => [
        'type' => 'integer',
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function __toString(): string {
    return $this->directory;
  }

}
