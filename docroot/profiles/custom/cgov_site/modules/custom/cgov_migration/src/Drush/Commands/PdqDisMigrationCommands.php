<?php

namespace Drupal\cgov_migration\Drush\Commands;

use Drupal\cgov_migration\DrugSummaryXmlParser;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Site\Settings;
use Drush\Attributes as CLI;
use Drush\Boot\DrupalBootLevels;
use Drush\Commands\AutowireTrait;
use Drush\Commands\DrushCommands;
use Symfony\Component\Console\Command\Command;

/**
 * Drush commands supporting the PDQ DIS XML migration.
 */
class PdqDisMigrationCommands extends DrushCommands {

  use AutowireTrait;

  /**
   * Constructs the PDQ DIS migration commands.
   */
  public function __construct(
    private readonly EntityTypeManagerInterface $entityTypeManager,
    private readonly DrugSummaryXmlParser $parser,
  ) {
    parent::__construct();
  }

  /**
   * Reconciles PDQ DIS XML documents with CMS nodes without changing content.
   *
   * @param array $options
   *   Command options.
   *
   * @option directory
   *   Absolute path to the content/en XML directory. Falls back to
   *   PDQ_DIS_XML_DIR or the pdq_dis_xml_directory setting.
   *
   * @usage cgov:pdq-dis-preflight
   *   Reconcile the configured XML directory with PDQ DIS nodes.
   * @usage cgov:pdq-dis-preflight --directory=/tmp/pdq/content/en
   *   Reconcile XML documents from a specific directory.
   */
  #[CLI\Command(name: 'cgov:pdq-dis-preflight')]
  #[CLI\Bootstrap(level: DrupalBootLevels::FULL)]
  #[CLI\Option(name: 'directory', description: 'Absolute path to the content/en XML directory.')]
  #[CLI\Usage(name: 'cgov:pdq-dis-preflight', description: 'Reconcile the configured XML directory with PDQ DIS nodes.')]
  #[CLI\Usage(name: 'cgov:pdq-dis-preflight --directory=/tmp/pdq/content/en', description: 'Reconcile XML documents from a specific directory.')]
  public function preflight(array $options = ['directory' => NULL]): int {
    $directory = $this->resolveDirectory($options['directory'] ?? NULL);
    $files = glob($directory . '/*.xml') ?: [];
    sort($files, SORT_NATURAL);
    if (!$files) {
      throw new \RuntimeException("No XML files found in $directory.");
    }

    $source = [];
    $source_duplicates = [];
    $source_errors = [];
    foreach ($files as $file) {
      try {
        $values = $this->parser->parseFile($file);
        $cdr_id = (int) $values['cdr_id'];
        $filename_id = (int) pathinfo($file, PATHINFO_FILENAME);
        if ($filename_id !== $cdr_id) {
          throw new \InvalidArgumentException(sprintf(
            '%s contains CDR%d; the filename and document ID must match.',
            basename($file),
            $cdr_id
          ));
        }
        if (isset($source[$cdr_id])) {
          $source_duplicates[$cdr_id][] = basename($file);
          continue;
        }
        $source[$cdr_id] = $values;
      }
      catch (\InvalidArgumentException $e) {
        $source_errors[basename($file)] = $e->getMessage();
      }
    }

    $node_storage = $this->entityTypeManager->getStorage('node');
    $nids = $node_storage->getQuery()
      ->condition('type', 'pdq_drug_information_summary')
      ->accessCheck(FALSE)
      ->execute();
    $nodes = $node_storage->loadMultiple($nids);
    $cms = [];
    $cms_without_cdr = [];
    $cms_urls = [];
    foreach ($nodes as $node) {
      $cdr_id = (int) $node->get('field_pdq_cdr_id')->value;
      if ($cdr_id < 1) {
        $cms_without_cdr[] = (int) $node->id();
        continue;
      }
      $cms[$cdr_id][] = (int) $node->id();
      $site_section_id = (int) $node->get('field_site_section')->target_id;
      $pretty_url = (string) $node->get('field_pretty_url')->value;
      if ($site_section_id && $pretty_url !== '') {
        $cms_urls[$site_section_id][$pretty_url][] = (int) $node->id();
      }
    }

    $matched = [];
    $to_create = [];
    $duplicate_cms = [];
    foreach (array_keys($source) as $cdr_id) {
      $matches = $cms[$cdr_id] ?? [];
      if (count($matches) === 1) {
        $matched[] = $cdr_id;
      }
      elseif (!$matches) {
        $to_create[] = $cdr_id;
      }
      else {
        $duplicate_cms[$cdr_id] = $matches;
      }
    }
    $cms_only = array_values(array_diff(array_keys($cms), array_keys($source)));

    $term_storage = $this->entityTypeManager->getStorage('taxonomy_term');
    $site_section_errors = [];
    $url_collisions = [];
    $site_sections = [];
    foreach ($source as $cdr_id => $values) {
      $path = (string) $values['site_section_path'];
      if (!array_key_exists($path, $site_sections)) {
        $terms = $term_storage->loadByProperties([
          'vid' => 'cgov_site_sections',
          'computed_path' => $path,
          'langcode' => 'en',
        ]);
        $site_sections[$path] = count($terms) === 1
          ? (int) reset($terms)->id()
          : NULL;
      }
      $site_section_id = $site_sections[$path];
      if ($site_section_id === NULL) {
        $site_section_errors[$cdr_id] = $path;
        continue;
      }

      $pretty_url = (string) $values['pretty_url'];
      $target_nids = $cms[$cdr_id] ?? [];
      $conflicting_nids = array_values(array_diff(
        $cms_urls[$site_section_id][$pretty_url] ?? [],
        $target_nids
      ));
      if ($conflicting_nids) {
        $url_collisions[$cdr_id] = $conflicting_nids;
      }
    }

    $this->io()->table(['Reconciliation check', 'Count'], [
      ['XML files', count($files)],
      ['Valid unique XML documents', count($source)],
      ['CMS PDQ DIS nodes', count($nodes)],
      ['Existing nodes to update', count($matched)],
      ['Missing nodes to create', count($to_create)],
      ['XML parse/filename errors', count($source_errors)],
      ['Duplicate XML CDR IDs', count($source_duplicates)],
      ['Duplicate CMS CDR IDs', count($duplicate_cms)],
      ['CMS nodes without a CDR ID', count($cms_without_cdr)],
      ['CMS CDR IDs without XML', count($cms_only)],
      ['Missing/ambiguous site sections', count($site_section_errors)],
      ['Pretty URL collisions', count($url_collisions)],
    ]);
    $this->printIds('CDR IDs to update', $matched);
    $this->printIds('CDR IDs to create', $to_create);
    $this->printIds('CMS-only CDR IDs', $cms_only);
    $this->printIds('CMS nodes without CDR IDs', $cms_without_cdr);
    $this->printMap('Duplicate CMS CDR IDs', $duplicate_cms);
    $this->printMap('Site-section errors', $site_section_errors);
    $this->printMap('Pretty URL collisions', $url_collisions);
    foreach ($source_errors as $file => $message) {
      $this->logger()->error('{file}: {message}', [
        'file' => $file,
        'message' => $message,
      ]);
    }

    $has_blockers = $source_errors ||
      $source_duplicates ||
      $duplicate_cms ||
      $cms_without_cdr ||
      $cms_only ||
      $site_section_errors ||
      $url_collisions;
    if ($has_blockers) {
      $this->logger()->error('PDQ DIS preflight found blocking reconciliation errors. No content was changed.');
      return Command::FAILURE;
    }

    $this->logger()->success('PDQ DIS preflight passed. No content was changed.');
    return Command::SUCCESS;
  }

  /**
   * Resolves and validates the XML source directory.
   */
  private function resolveDirectory(?string $option): string {
    $configured = $option
      ?? Settings::get('pdq_dis_xml_directory')
      ?? getenv('PDQ_DIS_XML_DIR');
    $directory = is_string($configured) ? realpath($configured) : FALSE;
    if (!$directory || !is_dir($directory) || !is_readable($directory)) {
      throw new \RuntimeException(
        'Set --directory, PDQ_DIS_XML_DIR, or $settings[\'pdq_dis_xml_directory\'] to a readable content/en XML directory.'
      );
    }
    return $directory;
  }

  /**
   * Prints a sorted list of numeric identifiers.
   */
  private function printIds(string $label, array $ids): void {
    if (!$ids) {
      return;
    }
    sort($ids, SORT_NUMERIC);
    $this->logger()->notice('{label}: {ids}', [
      'label' => $label,
      'ids' => implode(', ', $ids),
    ]);
  }

  /**
   * Prints a map of source identifiers to related values.
   */
  private function printMap(string $label, array $values): void {
    if (!$values) {
      return;
    }
    ksort($values, SORT_NUMERIC);
    foreach ($values as $id => $related) {
      $this->logger()->warning('{label} - {id}: {related}', [
        'label' => $label,
        'id' => $id,
        'related' => is_array($related) ? implode(', ', $related) : $related,
      ]);
    }
  }

}
