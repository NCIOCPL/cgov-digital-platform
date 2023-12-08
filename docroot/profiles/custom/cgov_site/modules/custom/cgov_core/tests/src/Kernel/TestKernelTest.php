<?php

namespace Drupal\Tests\cgov_core\Kernel;

use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests node body field storage.
 *
 * @group cgov_core
 */
class TestKernelTest extends KernelTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  protected static $modules = ['user', 'system', 'field', 'node',
    'text', 'filter', 'taxonomy', 'token', 'metatag',
  ];

  /**
   * Sets up the test environment.
   */
  protected function setUp(): void {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();
    $this->installSchema('system', 'sequences');
    // Necessary for module uninstall.
    $this->installSchema('user', 'users_data');
    $this->installEntitySchema('user');
    $this->installEntitySchema('node');
    $this->installEntitySchema('taxonomy_term');
    $this->installConfig(['field', 'node', 'metatag']);
  }

  /**
   * Tests kernel configuration.
   */
  public function testFieldOverrides() {
    $this->assertTrue(TRUE, 'Kernel Tests are Executing.');
  }

}
