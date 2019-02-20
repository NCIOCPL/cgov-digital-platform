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
  public static $modules = [
    'user',
    'system',
    'file',
    'link',
    'field',
    'image',
    'node',
    'text',
    'filter',
    'datetime',
    'options',
    'workflows',
    'content_moderation',
    'language',
    'content_translation',
    'cgov_core',
    'taxonomy',
    'views',
    'entity_browser',
    'entity_reference_revisions',
    'paragraphs',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setup();
    $this->installConfig([
      'field',
      'node',
      'user',
      'file',
      'image',
      'link',
      'workflows',
      'content_moderation',
      'language',
      'views',
      'entity_browser',
      'entity_reference_revisions',
      'paragraphs',
      'content_translation',
      'cgov_core',
      'taxonomy',
    ]);
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
