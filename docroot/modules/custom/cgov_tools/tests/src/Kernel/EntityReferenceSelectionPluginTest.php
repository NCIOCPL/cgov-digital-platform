<?php

namespace Drupal\Tests\cgov_tools\Kernel;

use Drupal\Component\FileCache\FileCacheFactory;
use Drupal\Core\Site\Settings;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\KernelTests\KernelTestBase as DrupalKernelTestBase;
use Drupal\node\Entity\NodeType;
use Drupal\node\Entity\Node;
use Drupal\entity_test\Entity\EntityTest;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FieldItemInterface;

/**
 * Class EntityReferenceSelectionPluginTest for Kernel test.
 *
 * Test scenarios.
 * - Create article and page content types.
 * - Create entity reference field with valid allowed bundles
 *  on entity_test content type.
 *  - Tests the result.
 *  - Create article node and entity_test node.
 *  - Tests the result.
 * - Create entity reference field with no allowed bundles
 *  on entity_test content type.
 *  - Tests the result.
 *  - Create article node and entity_test node.
 *  - Tests the result.
 * - Create entity reference field with invalid allowed bundles
 *  on entity_test content type.
 *  - Tests the result.
 *
 * @package Drupal\Tests\cgov_tools\Kernel
 */
class EntityReferenceSelectionPluginTest extends DrupalKernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'cgov_tools',
    'field',
    'user',
    'entity_test',
    'node',
    'system',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    FileCacheFactory::setPrefix(Settings::getApcuPrefix('file_cache', $this->root));
    parent::setUp();

    $this->installSchema('node', 'node_access');
    $this->installEntitySchema('node');
    $this->installEntitySchema('user');
    $this->installEntitySchema('entity_test');

    // Create Article content type.
    $article = NodeType::create([
      'type' => 'article',
      'name' => 'Test Article',
    ]);
    $article->save();

    // Create Page content type.
    $page = NodeType::create([
      'type' => 'page',
      'name' => 'Test Page',
    ]);
    $page->save();
  }

  /**
   * Tests that the 'handler' field setting stores the proper plugin ID.
   */
  public function testEntityReferenceSelection() {

    // Create Entity Reference Selection field with valid allowed_bundles.
    $field_name = 'field_reference_valid_bundles';
    $allowed_bundles = ['article', 'page'];
    $field_storage = FieldStorageConfig::create([
      'field_name' => $field_name,
      'entity_type' => 'entity_test',
      'type' => 'entity_reference',
    ]);
    $field_storage->save();
    // Specify the 'handler' setting in order to verify.
    $field = FieldConfig::create([
      'field_storage' => $field_storage,
      'bundle' => 'entity_test',
      'settings' => [
        'handler' => 'cgov_unpublished',
        'allowed_bundles' => $allowed_bundles,
      ],
    ]);
    $field->save();
    $field = FieldConfig::load($field->id());
    $this->assertEquals('cgov_unpublished', $field->getSetting('handler'));
    // Create article published node.
    $reference_node = Node::create([
      'type' => 'article',
      'title' => $this->randomMachineName(),
      'uid' => '1',
      'status' => 1,
    ]);
    $reference_node->save();
    $reference_node_id = $reference_node->id();
    // Create Entity Reference Selection content.
    $entity = EntityTest::create();
    $entity->field_reference_valid_bundles->target_id = $reference_node_id;
    $entity->save();
    $entity = EntityTest::load($entity->id());
    $this->assertInstanceOf(FieldItemListInterface::class, $entity->field_reference_valid_bundles);
    $this->assertInstanceOf(FieldItemInterface::class, $entity->field_reference_valid_bundles[0]);
    $this->assertEquals($reference_node_id, $entity->field_reference_valid_bundles->target_id);
    $this->assertEquals($reference_node->getTitle(), $entity->field_reference_valid_bundles->entity->getTitle());
    $this->assertEquals($reference_node_id, $entity->field_reference_valid_bundles->entity->id());

    // Create Entity Reference Selection field without allowed_bundles.
    $field_name = 'field_reference_no_bundles';
    $field_storage = FieldStorageConfig::create([
      'field_name' => $field_name,
      'entity_type' => 'entity_test',
      'type' => 'entity_reference',
    ]);
    $field_storage->save();
    // Specify the 'handler' setting in order to verify.
    $field = FieldConfig::create([
      'field_storage' => $field_storage,
      'bundle' => 'entity_test',
      'settings' => [
        'handler' => 'cgov_unpublished',
        'allowed_bundles' => '',
      ],
    ]);
    $field->save();
    $field = FieldConfig::load($field->id());
    $this->assertEquals('cgov_unpublished', $field->getSetting('handler'));
    // Create Entity Reference Selection content.
    $entity = EntityTest::create();
    $entity->field_reference_no_bundles->target_id = $reference_node_id;
    $entity->save();
    $entity = EntityTest::load($entity->id());
    $this->assertInstanceOf(FieldItemListInterface::class, $entity->field_reference_no_bundles);
    $this->assertInstanceOf(FieldItemInterface::class, $entity->field_reference_no_bundles[0]);
    $this->assertEquals($reference_node_id, $entity->field_reference_no_bundles->target_id);
    $this->assertEquals($reference_node->getTitle(), $entity->field_reference_no_bundles->entity->getTitle());
    $this->assertEquals($reference_node_id, $entity->field_reference_no_bundles->entity->id());

    // Create Entity Reference Selection field with invalid allowed_bundles.
    $field_name = 'field_reference_invalid_bundles';
    $field_storage = FieldStorageConfig::create([
      'field_name' => $field_name,
      'entity_type' => 'entity_test',
      'type' => 'entity_reference',
    ]);
    $field_storage->save();
    // Specify the 'handler' setting in order to verify.
    $field = FieldConfig::create([
      'field_storage' => $field_storage,
      'bundle' => 'entity_test',
      'settings' => [
        'handler' => 'cgov_unpublished',
        'allowed_bundles' => ['chicken'],
      ],
    ]);
    $field->save();
    $field = FieldConfig::load($field->id());
    $this->assertEquals('cgov_unpublished', $field->getSetting('handler'));
  }

}
