<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\NodeType;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\NodeTypeInterface;

/**
 * Base class which does most of the work for field storage tests.
 */
abstract class CGovFieldStorageTestBase extends KernelTestBase {

  /**
   * The field name to test.
   *
   * @var string
   */
  protected $fieldName;

  /**
   * The field label.
   *
   * @var string
   */
  protected $fieldLabel;

  /**
   * Sets up the test environment.
   */
  protected function setUp() {
    parent::setUp();
    $this->installSchema('system', 'sequences');
    // Necessary for module uninstall.
    $this->installSchema('user', 'users_data');
    $this->installEntitySchema('user');
    $this->installEntitySchema('node');
    $this->installConfig(['field', 'node', 'cgov_core']);
  }

  /**
   * Tests text(plain) field storage persistence.
   *
   * This will:
   *   - Check the config exists.
   *   - Check the field can be attached to a node.
   *   - Checks that when the node is removed the field still exists.
   *   - Checks that when the module is disabled, the field is removed.
   *
   * @param string $fieldName
   *   The machine name of the field to test.
   * @param string $fieldLabel
   *   The label of the field to test.
   */
  protected function baseTestPlainTextField($fieldName, $fieldLabel) {

    if (empty($fieldName) || empty($fieldLabel)) {
      throw new Exception("Field Name and Label MUST be set.");
    }

    // Check configuration for field.
    $field_storage = FieldStorageConfig::loadByName('node', $fieldName);
    $this->assertTrue($field_storage, "Node $fieldName field storage exists.");

    // Test that we can attach it to a new node.
    $type = NodeType::create(['name' => 'Ponies', 'type' => 'ponies']);
    $type->save();
    $this->addfield($type, $fieldName, $fieldLabel);
    $field_storage = FieldStorageConfig::loadByName('node', $fieldName);
    $this->assertTrue(count($field_storage->getBundles()) == 1, "Node $fieldName field storage is being used on the new node type.");

    // Remove from our content type.
    $field = FieldConfig::loadByName('node', 'ponies', $fieldName);
    $field->delete();

    // Ensure the field exists past its removal.
    $field_storage = FieldStorageConfig::loadByName('node', $fieldName);
    $this->assertTrue(count($field_storage->getBundles()) == 0, "Node $fieldName field storage exists after deleting the only instance of a field.");

    // Now uninstall the module and make sure it goes away.
    \Drupal::service('module_installer')->uninstall(['cgov_core']);
    $field_storage = FieldStorageConfig::loadByName('node', $fieldName);
    $this->assertFalse($field_storage, "Node $fieldName field storage does not exist after uninstalling the CGov Core module.");
  }

  /**
   * Adds a field to our new content type.
   *
   * @param Drupal\node\NodeTypeInterface $type
   *   The node type to attach the field.
   * @param string $fieldName
   *   The machine name of the field to attach.
   * @param string $label
   *   The label to use for the attached field.
   */
  private function addfield(NodeTypeInterface $type, $fieldName, $label) {
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
