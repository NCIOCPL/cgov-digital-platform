<?php

namespace Drupal\Tests\json_data_field\Kernel;

use Drupal\Component\FileCache\FileCacheFactory;
use Drupal\Core\Site\Settings;
use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\KernelTests\KernelTestBase as DrupalKernelTestBase;

/**
 * Class KernelTestBase for Kernel test.
 *
 * @package Drupal\Tests\json_data_field\Kernel
 */
abstract class KernelTestBase extends DrupalKernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'json_data_field',
    'field',
    'user',
    'entity_test',
    'serialization',
  ];

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    FileCacheFactory::setPrefix(Settings::getApcuPrefix('file_cache', $this->root));
    parent::setUp();

    $this->installEntitySchema('user');
    $this->installEntitySchema('entity_test');
  }

  /**
   * Creates a field to use in tests.
   *
   * @param array $field_storage_properties
   *   The field storage properties.
   * @param array $field_properties
   *   The field properties.
   */
  protected function createTestField(array $field_storage_properties = [], array $field_properties = []) {
    $field_storage = FieldStorageConfig::create([
      'field_name' => 'test_json_data_field',
      'entity_type' => 'entity_test',
      'type' => 'json_data',
    ] + $field_storage_properties);
    $field_storage->save();

    $field = FieldConfig::create([
      'field_name' => 'test_json_data_field',
      'entity_type' => 'entity_test',
      'type' => 'json_data',
      'bundle' => 'entity_test',
    ] + $field_properties);
    $field->save();
  }

}
