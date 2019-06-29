<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\media\Entity\MediaType;
use Drupal\KernelTests\KernelTestBase;
use Drupal\media\MediaTypeInterface;
use CgovPlatform\Tests\CgovSchemaExclusions;

/**
 * Base class which does most of the work for field storage tests.
 */
class CgovMediaFieldStorageTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = [
    'system',
    'user',
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
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();
    // These are special and cannot be installed as a dependency
    // for this module. So we have to install their bits separately.
    $this->installEntitySchema('user');
    $this->installSchema('user', ['users_data']);
    $this->installSchema('system', ['sequences']);
    $this->installConfig(['system', 'user']);

    // Install core and its dependencies.
    // This ensures that the install hook will fire, which sets up
    // the permissions for the roles we are testing below.
    \Drupal::service('module_installer')->install(['cgov_core']);
    \Drupal::service('module_installer')->install(['media_test_source']);
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
    \Drupal::service('module_installer')->uninstall(['cgov_core']);

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
