<?php

namespace Drupal\Tests\app_module\Functional;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Base class for App Module Reference field tests.
 */
abstract class AppModuleFieldBrowserTestBase extends BrowserTestBase {

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
   * The app module id.
   *
   * @var string
   */
  protected $appModuleId;

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'language',
    'path',
    'block',
    'node',
    'field_ui',
    'app_module',
    'app_module_test',
  ];

  /**
   * {@inheritdoc}
   *
   * Once installed, a content type with the desired field is created.
   */
  protected function setUp() {
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
      'administer app modules',
      'access administration pages',
      'administer url aliases',
    ];
    $this->administratorAccount = $this->drupalCreateUser($permissions);
    parent::drupalLogin($this->administratorAccount);

    // Create an app module type for selection.
    $this->appModuleId = strtolower($this->randomMachineName(10));
    $this->drupalPostForm(
      Url::fromRoute('entity.app_module.add_form'),
      [
        'label' => $this->appModuleId,
        'id' => $this->appModuleId,
        'app_module_plugin_id' => 'test_app_module_plugin',
      ],
      'Save'
    );

    // Prepare a new content type where the field will be added.
    $this->contentTypeName = strtolower($this->randomMachineName(10));
    $this->drupalGet('admin/structure/types/add');
    $edit = [
      'name' => $this->contentTypeName,
      'type' => $this->contentTypeName,
    ];
    $this->drupalPostForm(NULL, $edit, 'Save and manage fields');
    $this->assertText((string) new FormattableMarkup('The content type @name has been added.', ['@name' => $this->contentTypeName]));

    // Reset the permission cache.
    $create_permission = 'create ' . $this->contentTypeName . ' content';
    $this->checkPermissions([$create_permission], TRUE);

    // Now that we have a new content type, create a user that has privileges
    // on the content type.
    $this->authorAccount = $this->drupalCreateUser([
      $create_permission,
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
  protected function createField($type = 'app_module_reference', $widget_type = 'app_module_reference_select', $fieldFormatter = 'app_module_reference_formatter') {
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
    $this->drupalPostForm(NULL, $edit, 'Save and continue');

    /* NOTE: We should not need a cardinality because it is not an input field. */

    // And now we save the field settings.
    $this->drupalPostForm(NULL, [
      'settings[target_type]' => 'app_module',
    ], 'Save field settings');
    $this->verbose(
      (string) new FormattableMarkup('Saved settings for field %field_name with widget %widget_type and cardinality 1',
        [
          '%field_name' => $field_name,
          '%widget_type' => $widget_type,
          '%cardinality' => "1",
        ]
      )
    );
    $assert->pageTextContains((string) new FormattableMarkup('Updated field @name field settings.', ['@name' => $field_name]));

    // Set the widget type for the newly created field.
    $this->drupalGet('admin/structure/types/manage/' . $this->contentTypeName . '/form-display');
    $edit = [
      'fields[field_' . $field_name . '][type]' => $widget_type,
    ];
    $this->drupalPostForm(NULL, $edit, 'Save');

    // Set the field formatter for the newly created field.
    $this->drupalGet('admin/structure/types/manage/' . $this->contentTypeName . '/display');
    $edit1 = [
      'fields[field_' . $field_name . '][type]' => $fieldFormatter,
    ];
    $this->drupalPostForm(NULL, $edit1, 'Save');

    return $field_name;
  }

}
