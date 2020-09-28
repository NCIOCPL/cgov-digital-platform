<?php

namespace Drupal\Tests\app_module\Kernel;

use Drupal\KernelTests\KernelTestBase;
use Drupal\node\Entity\Node;

/**
 * Integration tests for App Path class.
 *
 * @group app_module
 */
class AppPathTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'system',
    'user',
    'path_alias',
  ];

  /**
   * App path storage.
   *
   * @var \Drupal\app_module\AppPathStorageInterface
   */
  protected $storage;

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setup();
    // These are special and cannot be installed as a dependency
    // for this module. So we have to install their bits separately.
    $this->installEntitySchema('user');
    $this->installEntitySchema('path_alias');
    $this->installSchema('system', ['sequences']);
    $this->installConfig(['system', 'user', 'path_alias']);

    // Install page and its dependencies.
    // This is so we do not have to install all the schemas.
    \Drupal::service('module_installer')->install(['app_node_test']);
    $this->storage = \Drupal::service('app_module.app_path_storage');
  }

  /**
   * Tests app modules.
   */
  public function testAppModule() {
    $this->checkBasicNode();
    $this->checkNodeWithData();

  }

  /**
   * Helper test for creating a basic node without data.
   *
   * Checks updating aliases.
   */
  private function checkBasicNode() {
    // 1. Create node with path.
    $node1 = Node::create([
      'type' => 'app_page',
      'title' => 'Test Node 1',
      'field_application_module' => [
        'target_id' => 'dummy_app_module',
      ],
      'path' => [
        'alias' => '/test-node-1',
      ],
    ]);

    $node1->save();

    // Assert app path was created.
    $app_path_1 = $this->storage->load(['owner_alias' => '/test-node-1']);
    $this->assertEquals($app_path_1['owner_alias'], '/test-node-1');

    // 2. Change alias.
    $node1->path->alias = '/test-node-1-updated';
    $node1->save();

    // Assert app path was updated.
    $app_path_1 = $this->storage->load(['owner_alias' => '/test-node-1-updated']);
    $this->assertEquals($app_path_1['owner_alias'], '/test-node-1-updated');

    // 3. Delete Node.
    $node1->delete();
    $app_path_1 = $this->storage->load(['owner_alias' => '/test-node-1-updated']);
    $this->assertFalse($app_path_1);
  }

  /**
   * Tests node with data.
   */
  private function checkNodeWithData() {
    $data = [
      'key1' => 'value1',
      'key2' => 'value2',
      'key3' => [
        'subkey1' => 'valuea',
        'subkey2' => 'valueb',
      ],
    ];

    $data2 = [
      'key1' => 'new-value1',
      'key2' => 'new-value2',
    ];

    // 1. Create node with path.
    $node1 = Node::create([
      'type' => 'app_page',
      'title' => 'Test Node 1',
      'field_application_module' => [
        'target_id' => 'dummy_app_module',
        'data' => $data,
      ],
      'path' => [
        'alias' => '/test-node-1',
      ],
    ]);

    $node1->save();

    // Assert app path was created.
    $app_path_1 = $this->storage->load(['owner_alias' => '/test-node-1']);
    $this->assertEquals($app_path_1['owner_alias'], '/test-node-1');
    $this->assertEquals($app_path_1['app_module_data'], $data);

    // Reload the node to make sure that the data survived.
    $node1 = Node::load($node1->id());
    $this->assertEquals($node1->field_application_module->data, $data);

    // 2. Change data.
    $node1->field_application_module->data = $data2;
    $node1->save();

    // Assert app path data was updated.
    $app_path_1 = $this->storage->load(['owner_alias' => '/test-node-1']);
    $this->assertEquals($app_path_1['app_module_data']['key1'], 'new-value1');

    // Reload the node to make sure that the data survived.
    $node1 = Node::load($node1->id());
    $this->assertEquals($node1->field_application_module->data, $data2);

  }

}
