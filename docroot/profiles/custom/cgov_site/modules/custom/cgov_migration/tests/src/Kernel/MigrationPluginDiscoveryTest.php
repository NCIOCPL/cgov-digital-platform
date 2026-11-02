<?php

namespace Drupal\Tests\cgov_migration\Kernel;

use Drupal\cgov_migration\Plugin\migrate\destination\PdqDrugInformationSummaryNode;
use Drupal\cgov_migration\Plugin\migrate\process\PdqMigrationDate;
use Drupal\cgov_migration\Plugin\migrate\source\PdqDrugInformationSummaryXml;
use Drupal\KernelTests\KernelTestBase;

/**
 * Verifies that the PDQ DIS migration plugins are discoverable.
 *
 * @group cgov_migration
 */
class MigrationPluginDiscoveryTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'config',
    'config_update',
    'features',
    'migrate',
    'migrate_plus',
    'nci_definition',
    'pdq_drug_information_summary',
    'cgov_migration',
  ];

  /**
   * Tests the source, process, and destination plugin definitions.
   */
  public function testPluginDiscovery(): void {
    $this->installConfig(['cgov_migration']);
    $this->assertSame(
      'pdq_dis_node',
      $this->config('migrate_plus.migration.pdq_dis_xml')->get('destination.plugin')
    );

    $source = $this->container
      ->get('plugin.manager.migrate.source')
      ->getDefinition('pdq_dis_xml');
    $this->assertContains('cgov_migration', (array) $source['provider']);

    $process = $this->container
      ->get('plugin.manager.migrate.process')
      ->getDefinition('pdq_migration_date');
    $this->assertContains('cgov_migration', (array) $process['provider']);

    $destination = $this->container
      ->get('plugin.manager.migrate.destination')
      ->getDefinition('pdq_dis_node');
    $this->assertContains('cgov_migration', (array) $destination['provider']);

    $migration = $this->container
      ->get('plugin.manager.migration')
      ->createStubMigration([
        'id' => 'pdq_dis_plugin_test',
        'source' => [
          'plugin' => 'pdq_dis_xml',
          'directory' => __DIR__,
        ],
        'process' => [
          'reviewed_date' => [
            'plugin' => 'pdq_migration_date',
          ],
        ],
        'destination' => [
          'plugin' => 'pdq_dis_node',
        ],
      ]);
    $this->assertInstanceOf(PdqDrugInformationSummaryXml::class, $migration->getSourcePlugin());
    $this->assertInstanceOf(PdqDrugInformationSummaryNode::class, $migration->getDestinationPlugin());
    $this->assertInstanceOf(
      PdqMigrationDate::class,
      $migration->getProcessPlugins()['reviewed_date'][0]
    );
  }

}
