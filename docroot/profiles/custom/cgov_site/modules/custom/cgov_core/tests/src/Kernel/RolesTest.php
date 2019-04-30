<?php

namespace Drupal\Tests\cgov_core\Kernel;

use Drupal\KernelTests\KernelTestBase;
use CgovPlatform\Tests\CgovSchemaExclusions;

/**
 * Tests the my custom service.
 *
 * @group my_custom_module
 */
class RolesTest extends KernelTestBase {

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
    'embed',
    'entity_embed',
    'entity_browser',
    'entity_reference_revisions',
    'paragraphs',
    'block',
    'block_content',
    'token',
    'token_filter',
    'editor',
    'metatag',
  ];

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setup();
    $this->installEntitySchema('block_content');
    $this->installEntitySchema('content_moderation_state');
    $this->installEntitySchema('node');
    $this->installEntitySchema('taxonomy_term');
    $this->installEntitySchema('user');
    $this->installEntitySchema('workflow');
    $this->installEntitySchema('paragraph');
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
      'embed',
      'entity_embed',
      'entity_browser',
      'entity_reference_revisions',
      'paragraphs',
      'content_translation',
      'cgov_core',
      'taxonomy',
      'block',
      'block_content',
      'token',
      'token_filter',
      'editor',
      'metatag',
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
