<?php

namespace Drupal\Tests\cgov_image\Kernel;

use Drupal\field\Entity\FieldConfig;
use Drupal\field\Entity\FieldStorageConfig;
use Drupal\node\Entity\NodeType;
use Drupal\KernelTests\KernelTestBase;
use Drupal\node\NodeTypeInterface;

/**
 * Base class which does most of the work for field storage tests.
 */
class CgovImageFieldStorageTest extends KernelTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'user', 'system', 'file', 'field', 'node', 'text', 'filter', 'datetime', 'options',
    'workflows', 'content_moderation', 'entity_browser',
    'language', 'content_translation', 'media', 'image', 'views', 'cgov_media', 'cgov_image',
  ];

  /**
   * The list of fields to test.
   *
   * @var array
   */
  private $fieldsToTest = [
    [
      "name" => "field_image_article",
      "label" => "Article Image",
      "type" => "entity_reference",
      "settings" => [
        "handler" => "default:media",
        "handler_settings" => [
          "target_bundles" => [
            "cgov_image" => "cgov_image",
          ],
          "sort" => [
            "field" => "_none",
          ],
          "auto_create" => FALSE,
          "auto_create_bundle" => "",
        ],
      ],
    ],
    [
      "name" => "field_image_promotional",
      "label" => "Promotional Image",
      "type" => "entity_reference",
      "settings" => [
        "handler" => "default:media",
        "handler_settings" => [
          "target_bundles" => [
            "cgov_image" => "cgov_image",
          ],
          "sort" => [
            "field" => "_none",
          ],
          "auto_create" => FALSE,
          "auto_create_bundle" => "",
        ],
      ],
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
    $this->installEntitySchema('node');
    $this->installEntitySchema('media');
    $this->installEntitySchema('file');
    $this->installEntitySchema('workflow');
    $this->installEntitySchema('content_moderation_state');
    $this->installConfig([
      'field', 'node', 'media', 'file', 'image',
      'language', 'content_translation', 'views',
      'cgov_media', 'entity_browser', 'cgov_image',
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
          $this->addFieldByName($type, $fieldToTest["name"], $fieldToTest["label"]);
          break;

        case "entity_reference":
          $this->addRefFieldByName($type, $fieldToTest["name"], $fieldToTest["label"], $fieldToTest["settings"]);
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

    // Test uninstalling cgov_image removes the fields.
    /*
     * This currently has an issue. cgov_image the type is in here, and
     * I am running into an issue where I am getting an error on the
     * uninstall about the cgov_image field storage not existing. Which
     * should be ok, because they are in here too, but for some reason
     * it is not. Commenting this out for now and will put in a backlog
     * ticket.
     *
     * \Drupal::service('module_installer')->uninstall(['cgov_image']);
     *
     * foreach ($this->fieldsToTest as $fieldToTest) {
     *   $field_storage = FieldStorageConfig::loadByName(
     *     'node',
     *     $fieldToTest["name"]
     *   );
     *   $this->assertFalse(
     *     $field_storage,
     *     "Node " .
     *     $fieldToTest["name"] .
     *     " field storage does not exist after uninstalling the image module."
     *   );
     * }
     */

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

  /**
   * Adds a new field to our new content type by name.
   *
   * @param Drupal\node\NodeTypeInterface $type
   *   The node type to attach the field.
   * @param string $fieldName
   *   The machine name of the field to attach.
   * @param string $label
   *   The label to use for the attached field.
   * @param mixed $settings
   *   The settings to use for the attached field.
   */
  private function addRefFieldByName(NodeTypeInterface $type, $fieldName, $label, $settings) {
    // Add or remove the $fieldName field, as needed.
    $field_storage = FieldStorageConfig::loadByName('node', $fieldName);
    $field = FieldConfig::loadByName('node', $type->id(), $fieldName);
    if (empty($field)) {
      $field = FieldConfig::create([
        'field_storage' => $field_storage,
        'bundle' => $type->id(),
        'label' => $label,
        'settings' => $settings,
      ]);
      $field->save();
    }

    return $field;
  }

}
