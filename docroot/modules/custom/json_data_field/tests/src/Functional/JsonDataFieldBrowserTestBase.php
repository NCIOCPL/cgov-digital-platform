<?php

namespace Drupal\Tests\json_data_field\Functional;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\file\Entity\File;
use Drupal\Tests\BrowserTestBase;

/**
 * Base class for json data field field tests.
 */
abstract class JsonDataFieldBrowserTestBase extends BrowserTestBase {

  /**
   * The content type name.
   *
   * @var string
   */
  protected $contentTypeName;

  /**
   * The administrator account.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $administratorAccount;

  /**
   * The author account.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $authorAccount;

  /**
   * The field name.
   *
   * @var string
   */
  protected $fieldName;

  /**
   * Modules to enable.
   *
   * @var array
   */
  protected static $modules = [
    'language',
    'path',
    'block',
    'node',
    'file',
    'field_ui',
    'json_data_field',
  ];

  /**
   * The theme to use with this test.
   *
   * Olivero is required for us to find the pre tag in the widget test.
   * Stable9 does not add in the class attributes for fields, and our
   * xpath query was not finding the json content.
   *
   * @var string
   */
  protected $defaultTheme = 'olivero';

  /**
   * {@inheritdoc}
   *
   * Once installed, a content type with the desired field is created.
   */
  protected function setUp(): void {
    // Install Drupal.
    parent::setUp();

    $this->drupalPlaceBlock('system_menu_block:tools', ['region' => 'primary_menu']);
    $this->drupalPlaceBlock('local_tasks_block', ['region' => 'secondary_menu']);
    $this->drupalPlaceBlock('local_actions_block', ['region' => 'content']);
    $this->drupalPlaceBlock('page_title_block', ['region' => 'content']);

    // Create and login a user that creates the content type.
    $permissions = [
      'administer content types',
      'administer node fields',
      'administer node form display',
      'administer node display',
      'access administration pages',
      'administer url aliases',
    ];
    $this->administratorAccount = $this->drupalCreateUser($permissions);
  }

  /**
   * Helper function for setting up data and asserting form fields worked ok.
   */
  protected function setupAndAssertForTests() {
    $this->drupalLogin($this->administratorAccount);

    // Prepare a new content type where the field will be added.
    $this->contentTypeName = strtolower($this->randomMachineName(10));
    $this->drupalGet('admin/structure/types/add');
    $edit = [
      'name' => $this->contentTypeName,
      'type' => $this->contentTypeName,
    ];
    $this->submitForm($edit, 'Save and manage fields');
    $this->assertSession()->pageTextContains((string) new FormattableMarkup('The content type @name has been added.', ['@name' => $this->contentTypeName]));

    // Reset the permission cache.
    $create_permission = 'create ' . $this->contentTypeName . ' content';
    $this->checkPermissions([$create_permission]);
    $edit_permission = 'edit any ' . $this->contentTypeName . ' content';
    $this->checkPermissions([$edit_permission]);

    // Now that we have a new content type, create a user that has privileges
    // on the content type.
    $this->authorAccount = $this->drupalCreateUser([
      $create_permission,
      $edit_permission,
      'create url aliases',
    ]);
  }

  /**
   * Create a field on the content type created during setUp().
   *
   * @param string $type
   *   The storage field type to create.
   * @param string $widget_type
   *   The widget to use when editing this field.
   * @param string $fieldFormatter
   *   The formatter to use when editing this field.
   *
   * @return string
   *   Name of the field, like field_something
   */
  protected function createField($type = 'json_data', $widget_type = 'yaml_textarea', $fieldFormatter = 'json_data_formatter') {
    $assert = $this->assertSession();

    $this->drupalGet('admin/structure/types/manage/' . $this->contentTypeName . '/fields');

    // Go to the 'Add field' page.
    $this->clickLink('Add field');

    // Make a name for this field.
    $field_name = strtolower($this->randomMachineName(10));

    // Fill out the field form.
    $edit = [
      'new_storage_type' => $type,
      'field_name' => $field_name,
      'label' => $field_name,
    ];
    $this->submitForm($edit, 'Save and continue');

    // Get JsonSchema file.
    $schema_file = \Drupal::service('extension.list.module')->getPath('json_data_field') . '/tests/schema.json';
    $schema_data = file_get_contents($schema_file);
    $file = File::create([
      'uid' => 1,
      'filename' => 'schema.json',
      'uri' => 'public://json_data_field/schema.json',
      'status' => 1,
    ]);
    $file->save();

    // Get file URL.
    $dir = dirname($file->getFileUri());
    if (!file_exists($dir)) {
      mkdir($dir, 0770, TRUE);
    }
    file_put_contents($file->getFileUri(), $schema_data);
    $file->save();

    /* NOTE: We need a cardinality because it is an input field. */

    $edit = [
      'cardinality' => 'number',
      'cardinality_number' => 1,
      'settings[json_schema_file][json_schema_file_uri]' => $file->getFileUri(),
    ];

    // And now we save the field settings.
    $this->submitForm($edit, 'Save field settings');

    $assert->pageTextContains((string) new FormattableMarkup('Updated field @name field settings.', ['@name' => $field_name]));

    // Set the widget type for the newly created field.
    $this->drupalGet('admin/structure/types/manage/' . $this->contentTypeName . '/form-display');
    $edit = [
      'fields[field_' . $field_name . '][type]' => $widget_type,
    ];
    $this->submitForm($edit, 'Save');

    // Set the field formatter for the newly created field.
    $this->drupalGet('admin/structure/types/manage/' . $this->contentTypeName . '/display');
    $edit1 = [
      'fields[field_' . $field_name . '][type]' => $fieldFormatter,
    ];
    $this->submitForm($edit1, 'Save');

    return $field_name;
  }

}
