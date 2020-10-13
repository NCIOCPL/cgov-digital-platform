<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\NodeType;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\NodeTypeInterface;
use CgovPlatform\Tests\CgovSchemaExclusions;

/**
 * Base class which does most of the work for field storage tests.
 */
class PDQFieldStorageTest extends KernelTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'user', 'system', 'file', 'field', 'image', 'node', 'text', 'filter', 'datetime', 'options', 'workflows', 'content_moderation',
    'language', 'content_translation', 'pdq_core', 'paragraphs', 'rest', 'serialization', 'token', 'metatag',
  ];

  /**
   * The list of fields to test.
   *
   * @var array
   */
  private $fieldsToTest = [
    [
      "name" => "field_pdq_cdr_id",
      "label" => "CDR ID",
      "type" => "integer",
    ],
    [
      "name" => "field_pdq_audience",
      "label" => "Audience",
      "type" => "list_string",
    ],
    [
      "name" => "field_pdq_url",
      "label" => "PDQ Summary URL",
      "type" => "string",
    ],
  ];

  /**
   * Sets up the test environment.
   */
  protected function setUp() {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();
    $this->installSchema('system', 'sequences');
    // Necessary for module uninstall.
    $this->installSchema('user', 'users_data');
    $this->installEntitySchema('user');
    $this->installEntitySchema('node');
    $this->installEntitySchema('file');
    $this->installEntitySchema('paragraph');
    $this->installEntitySchema('workflow');
    $this->installEntitySchema('content_moderation_state');
    $this->installConfig([
      'field', 'node', 'file', 'language', 'content_translation', 'pdq_core',
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

    // Test that we can attach the fields to a new node.
    $type = NodeType::create(['name' => 'Ponies', 'type' => 'ponies']);
    $type->save();

    foreach ($this->fieldsToTest as $fieldToTest) {
      switch ($fieldToTest["type"]) {
        // Test plain and formatted (html) text fields identically.
        case "plain_text":
        case "formatted_text":
        case "datetime":
        case "list_string":
        case "string":
        case "integer":
          $this->addFieldByName($type, $fieldToTest["name"], $fieldToTest["label"]);
          break;
      }
      $field_storage = FieldStorageConfig::loadByName('node', $fieldToTest["name"]);
      $this->assertTrue(count($field_storage->getBundles()) == 1, "Node " . $fieldToTest["name"] . " field storage is being used on the new node type.");
    }

    // Test the field persistance when it has been removed from all nodes.
    foreach ($this->fieldsToTest as $fieldToTest) {

      // Remove from our content type.
      $field = FieldConfig::loadByName('node', 'ponies', $fieldToTest["name"]);
      $field->delete();

      // Ensure the field exists past its removal.
      $field_storage = FieldStorageConfig::loadByName('node', $fieldToTest["name"]);
      $this->assertTrue(count($field_storage->getBundles()) == 0, "Node " . $fieldToTest["name"] . " field storage exists after deleting the only instance of a field.");
    }

    // Test uninstalling pdq_core removes the fields.
    \Drupal::service('module_installer')->uninstall(['pdq_core']);

    foreach ($this->fieldsToTest as $fieldToTest) {
      $field_storage = FieldStorageConfig::loadByName('node', $fieldToTest["name"]);
      $this->assertFalse($field_storage, "Node " . $fieldToTest["name"] . " field storage does not exist after uninstalling the CGov Core module.");
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
    $field_storage = FieldStorageConfig::loadByName('node', $fieldName);
    $this->assertTrue($field_storage, "Node $fieldName field storage exists.");
  }

  /**
   * Adds a new field to our new content type by name.
   *
   * @param Drupal\node\NodeTypeInterface $type
   *   The node type to attach the field.
   * @param string $fieldName
   *   The machine name of the field to attach.
   * @param string $label
   *   The label to use for the attached field.
   */
  private function addFieldByName(NodeTypeInterface $type, $fieldName, $label) {
    // Add or remove the $fieldName field, as needed.
    $field_storage = FieldStorageConfig::loadByName('node', $fieldName);
    $field = FieldConfig::loadByName('node', $type->id(), $fieldName);
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
