<?php

namespace Drupal\Tests\cgov_media\Kernel\FieldStorage;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\media\Entity\MediaType;
use Drupal\KernelTests\KernelTestBase;
use Drupal\media\MediaTypeInterface;

/**
 * Base class which does most of the work for field storage tests.
 */
class CgovMediaFieldStorageTest extends KernelTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'user', 'system', 'file', 'field', 'image', 'media', 'text', 'filter',
    'datetime', 'options', 'workflows', 'content_moderation', 'language',
    'content_translation', 'media_test_source', 'cgov_media',
  ];

  /**
   * The list of fields to test.
   *
   * @var array
   */
  private $fieldsToTest = [
    [
      "name" => "field_caption",
      "label" => "Caption",
      "type" => "plain_text",
    ],
    [
      "name" => "field_original_source",
      "label" => "Original Source",
      "type" => "plain_text",
    ],
  ];

  /**
   * Sets up the test environment.
   */
  protected function setUp() {
    parent::setUp();
    $this->installSchema('system', 'sequences');
    // Necessary for module uninstall.
    $this->installSchema('user', 'users_data');
    $this->installEntitySchema('user');
    $this->installEntitySchema('media');
    $this->installEntitySchema('file');
    $this->installEntitySchema('workflow');
    $this->installEntitySchema('content_moderation_state');
    $this->installConfig([
      'field', 'media', 'file', 'language', 'content_translation',
      'media_test_source', 'cgov_media',
    ]);
  }

  /**
   * Tests field storage persistence.
   *
   * This will:
   *   - Check the config exists.
   *   - Check the field can be attached to a node.
   *   - Checks that when the node is removed the field still exists.
   *   - Checks that when the module is disabled, the field is removed.
   */
  public function testFields() {

    // Test Field Configurations.
    foreach ($this->fieldsToTest as $fieldToTest) {
      $this->assertFieldConfig($fieldToTest["name"], $fieldToTest["label"], $fieldToTest["type"]);
    }

    // Test that we can attach the fields to a new media type.
    // The source type of 'test' comes from media's test module,
    // media_source_test.
    $type = MediaType::create([
      'id' => 'ponies',
      'label' => 'Ponies',
      'source' => 'test',
    ]);
    $type->save();

    foreach ($this->fieldsToTest as $fieldToTest) {
      switch ($fieldToTest["type"]) {
        // Test plain and formatted (html) text fields identically.
        case "plain_text":
        case "formatted_text":
        case "datetime":
        case "list_string":
          $this->addFieldByName($type, $fieldToTest["name"], $fieldToTest["label"]);
          break;
      }
      $field_storage = FieldStorageConfig::loadByName('media', $fieldToTest["name"]);
      $this->assertTrue(count($field_storage->getBundles()) == 1, "Media " . $fieldToTest["name"] . " field storage is being used on the new media type.");
    }

    // Test the field persistance when it has been removed from all nodes.
    foreach ($this->fieldsToTest as $fieldToTest) {
      // Remove from our content type.
      $field = FieldConfig::loadByName('media', 'ponies', $fieldToTest["name"]);
      $field->delete();

      // Ensure the field exists past its removal.
      $field_storage = FieldStorageConfig::loadByName('media', $fieldToTest["name"]);
      $this->assertTrue(count($field_storage->getBundles()) == 0, "Media " . $fieldToTest["name"] . " field storage exists after deleting the only instance of a field.");
    }

    // Test uninstalling cgov_core removes the fields.
    \Drupal::service('module_installer')->uninstall(['cgov_media']);

    foreach ($this->fieldsToTest as $fieldToTest) {
      $field_storage = FieldStorageConfig::loadByName('media', $fieldToTest["name"]);
      $this->assertFalse($field_storage, "Media " . $fieldToTest["name"] . " field storage does not exist after uninstalling the CGov Media module.");
    }

  }

  /**
   * Checks the existance of a field configuration.
   *
   * @param string $fieldName
   *   The name of the field to test.
   * @param string $fieldLabel
   *   The label of the field to test.
   * @param string $fieldType
   *   The type of the field to test.
   */
  private function assertFieldConfig($fieldName, $fieldLabel, $fieldType) {
    $field_storage = FieldStorageConfig::loadByName('media', $fieldName);
    $this->assertTrue($field_storage, "Media $fieldName field storage exists.");
  }

  /**
   * Adds a new field to our new content type by name.
   *
   * @param Drupal\media\MediaTypeInterface $type
   *   The media type to attach the field.
   * @param string $fieldName
   *   The machine name of the field to attach.
   * @param string $label
   *   The label to use for the attached field.
   */
  private function addFieldByName(MediaTypeInterface $type, $fieldName, $label) {
    // Add or remove the $fieldName field, as needed.
    $field_storage = FieldStorageConfig::loadByName('media', $fieldName);
    $field = FieldConfig::loadByName('media', $type->id(), $fieldName);
    if (empty($field)) {
      $field = FieldConfig::create([
        'field_storage' => $field_storage,
        'bundle' => $type->id(),
        'label' => $label,
      ]);
      $field->save();
    }

    return $field;
  }

}
