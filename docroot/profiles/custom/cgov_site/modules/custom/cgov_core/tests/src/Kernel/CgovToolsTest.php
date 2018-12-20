<?php

namespace Drupal\Tests\cgov_core\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\NodeType;
use Drupal\Tests\node\Traits\NodeCreationTrait;
use Drupal\Tests\user\Traits\UserCreationTrait;

/**
 * Ensure that cgov_site tools utilities conform to requirements.
 *
 * @group cgov
 * @group cgov_core
 */
class CgovToolsTest extends KernelTestBase {

  use NodeCreationTrait;
  use UserCreationTrait;

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'cgov_core',
    'content_moderation',
    'content_translation',
    'datetime',
    'field',
    'file',
    'filter',
    'language',
    'node',
    'options',
    'system',
    'text',
    'user',
    'workflows',
  ];

  /**
   * Users with role permissions to be tested.
   *
   * @var array
   */
  protected $users = [];

  /**
   * CgovTools Helper Service.
   *
   * @var \Drupal\cgov_core\CgovCoreTools
   *   Use to access CgovTools class methods
   */
  protected $cgovTools;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->cgovTools = \Drupal::service('cgov_core.tools');
    $this->installEntitySchema('user');
    $this->installEntitySchema('workflow');
    $this->installEntitySchema('node');
    $this->installEntitySchema('content_moderation_state');
    $this->installConfig([
      'cgov_core',
      'content_moderation',
      'content_translation',
      'field',
      'file',
      'node',
      'user',
      'filter',
      'language',
      'user',
      // 'workflows', .
    ]);
    $this->installSchema('system', ['sequences']);
    $this->installSchema('node', ['node_access']);
    $node_type = NodeType::create(['type' => 'pony', 'label' => 'Pony']);
    $node_type->save();
    $this->users['admin'] = $this->createUser([], NULL, TRUE);
    $this->users['author'] = $this->createUser();
    $this->users['author']->addRole('content_author');
    $this->users['editor'] = $this->createUser();
    $this->users['editor']->addRole('content_author');
    $this->users['editor']->addRole('content_editor');
    $this->users['advanced'] = $this->createUser();
    $this->users['advanced']->addRole('content_author');
    $this->users['advanced']->addRole('content_editor');
    $this->users['advanced']->addRole('advanced_editor');
    $this->users['layout'] = $this->createUser();
    $this->users['layout']->addRole('layout_manager');
  }

  /**
   * Verify the addContentTypePermissions() method works as expected.
   */
  public function testAddContentTypePermissions() {
    // @todo: Remove any existing permissions.
    $account = $this->users['author'];
    $this->setCurrentUser($account);

    // Verify permissions exist.
    $this->assertTrue($this->checkPermissions(['edit any pony content']), 'Permission "edit any pony content" exists.');
    $this->assertTrue($this->checkPermissions(['create pony content']), 'Permission "create [content_type] content" exists.');
    $this->assertTrue($this->checkPermissions(['delete any pony content']), 'Permission "delete any [content_type] content" exists.');
    $this->assertTrue($this->checkPermissions(['delete own pony content']), 'Permission "delete own [content_type] content" exists.');
    $this->assertTrue($this->checkPermissions(['edit any pony content']), 'Permission "edit any [content_type] content" exists.');
    $this->assertTrue($this->checkPermissions(['edit own pony content']), 'Permission "edit own [content_type] content" exists.');
    $this->assertTrue($this->checkPermissions(['revert pony revisions']), 'Permission "revert [content_type] revisions" exists.');
    /* $this->assertTrue($this->checkPermissions(['translate pony node']), 'Permission "translate [content_type] revisions" exists.'); */
    $this->assertTrue($this->checkPermissions(['view pony revisions']), 'Permission "view [content_type] revisions" exists.');
    $this->assertTrue($this->checkPermissions(['delete pony revisions']), 'Permission [content_type] revisions" exists.');

    // Verify permissions are not currently set.
    $this->assertFalse($account->hasPermission('create pony content'), 'User now has "create [content_type] content" permission.');
    $this->assertFalse($account->hasPermission('delete any pony content'), 'User now has "delete any [content_type] content" permission.');
    $this->assertFalse($account->hasPermission('delete own pony content'), 'User now has "delete own [content_type] content" permission.');
    $this->assertFalse($account->hasPermission('edit any pony content'), 'User now has "edit any [content_type] content" permission.');
    $this->assertFalse($account->hasPermission('edit own pony content'), 'User now has "edit own [content_type] content" permission.');
    $this->assertFalse($account->hasPermission('revert pony revisions'), 'User now has "revert [content_type] revisions" permission.');
    $this->assertFalse($account->hasPermission('translate pony node'), 'User now has "translate [content_type] revisions" permission.');
    $this->assertFalse($account->hasPermission('view pony revisions'), 'User now has "view [content_type] revisions" permission.');
    $this->assertFalse($account->hasPermission('delete pony revisions'), 'User does not have "delete [content_type] revisions" permission.');

    // Add content type permissions.
    $this->cgovTools->addContentTypePermissions('pony',
      ['content_author', 'content_editor', 'advanced_editor']);

    // Verify permissions are set.
    $this->assertTrue($account->hasPermission('create pony content'), 'User now has "create [content_type] content" permission.');
    $this->assertTrue($account->hasPermission('delete any pony content'), 'User now has "delete any [content_type] content" permission.');
    $this->assertTrue($account->hasPermission('delete own pony content'), 'User now has "delete own [content_type] content" permission.');
    $this->assertTrue($account->hasPermission('edit any pony content'), 'User now has "edit any [content_type] content" permission.');
    $this->assertTrue($account->hasPermission('edit own pony content'), 'User now has "edit own [content_type] content" permission.');
    $this->assertTrue($account->hasPermission('revert pony revisions'), 'User now has "revert [content_type] revisions" permission.');
    $this->assertTrue($account->hasPermission('translate pony node'), 'User now has "translate [content_type] revisions" permission.');
    $this->assertTrue($account->hasPermission('view pony revisions'), 'User now has "view [content_type] revisions" permission.');
    $this->assertFalse($account->hasPermission('delete pony revisions'), 'User does not have "delete [content_type] revisions" permission.');
  }

}
