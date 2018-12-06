<?php

namespace Drupal\Tests\cgov_core\Kernel;

use Drupal\KernelTests\Core\Entity\EntityKernelTestBase;

/**
 * Tests the my custom service.
 *
 * @group my_custom_module
 */
class RolesTest extends EntityKernelTestBase {

  /**
   * Modules to install.
   *
   * @var array
   */
  public static $modules = ['user', 'system', 'node', 'cgov_core'];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setup();
    $this->installConfig(['field', 'node', 'user', 'cgov_core']);
  }

  /**
   * Tests the Roles are defined.
   */
  public function testRoles() {
    $roles = user_roles();
    $this->assertArrayHasKey('anonymous', $roles, 'Anonymous role exists.');
    $this->assertArrayHasKey('authenticated', $roles, 'Authenticated role exists.');
    // No test for 'adminstrator' (defined in cgov_site install profile)
    $this->assertArrayHasKey('content_author', $roles, 'Content Author role exists.');
    $this->assertArrayHasKey('content_editor', $roles, 'Content Editor role exists.');
    $this->assertArrayHasKey('layout_manager', $roles, 'Layout Manager role exists.');
    $this->assertArrayHasKey('site_admin', $roles, 'Site Admin role exists.');
  }

}
