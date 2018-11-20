<?php

namespace CGov\Tests\Core\Kernel;

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
  public static $modules = ['user', 'system', 'field', 'node', 'text', 'filter'];

  /**
   * Sets up the test environment.
   */
  protected function setUp() {
    parent::setUp();
    $this->installSchema('system', 'sequences');
    // Necessary for module uninstall.
    $this->installSchema('user', 'users_data');
    $this->installEntitySchema('user');
    $this->installEntitySchema('node');
    $this->installConfig(['field', 'node']);
  }

  /**
   * Tests kernel configuration.
   */
  public function testFieldOverrides() {
    $this->assertTrue(TRUE, 'Kernel Tests are Executing.');
  }

}
