<?php

namespace Drupal\Tests\cgov_core\Kernel;

use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\KernelTests\KernelTestBase;
use Drupal\user\Entity\Role;

/**
 * Tests the my custom service.
 *
 * @group my_custom_module
 */
class RolesTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'system',
    'user',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp(): void {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setup();
    // These are special and cannot be installed as a dependency
    // for this module. So we have to install their bits separately.
    $this->installEntitySchema('user');
    $this->installSchema('system', ['sequences']);
    $this->installConfig(['system', 'user']);

    // Install core and its dependencies.
    // This ensures that the install hook will fire, which sets up
    // the permissions for the roles we are testing below.
    \Drupal::service('module_installer')->install(['cgov_core']);
  }

  /**
   * Tests the Roles are defined.
   */
  public function testRoles() {
    $roles = Role::loadMultiple();
    $this->assertArrayHasKey('anonymous', $roles, 'Anonymous role exists.');
    $this->assertArrayHasKey('authenticated', $roles, 'Authenticated role exists.');
    // No test for 'adminstrator' (defined in cgov_site install profile)
    $this->assertArrayHasKey('content_author', $roles, 'Content Author role exists.');
    $this->assertArrayHasKey('content_editor', $roles, 'Content Editor role exists.');
    $this->assertArrayHasKey('layout_manager', $roles, 'Layout Manager role exists.');
    $this->assertArrayHasKey('site_admin', $roles, 'Site Admin role exists.');
  }

}
