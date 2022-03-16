<?php

namespace Drupal\Tests\cgov_tools\Functional;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Tests\BrowserTestBase;
use Drupal\node\Entity\NodeType;
use Drupal\node\Entity\Node;

/**
 * Class EntityReferenceSelectionPluginTest.
 *
 * Entity reference selection field tests.
 * Test scenarios.
 * - Create entity_reference_test content type.
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
 */
class EntityReferenceSelectionPluginTest extends BrowserTestBase {

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
  public static $modules = [
    'language',
    'path',
    'node',
    'field_ui',
    'cgov_tools',
  ];

  /**
   * The theme to use with this test.
   *
   * @var string
   */
  protected $defaultTheme = 'classy';

  /**
   * {@inheritdoc}
   *
   * Once installed, a content type with the desired field is created.
   */
  protected function setUp() {
    // Install Drupal.
    parent::setUp();

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
    $this->contentTypeName = 'entity_reference_test';
    $this->drupalGet('admin/structure/types/add');
    $edit = [
      'name' => $this->contentTypeName,
      'type' => $this->contentTypeName,
    ];
    $this->submitForm($edit, 'Save and manage fields');
    $this->assertSession()->pageTextContains((string) new FormattableMarkup('The content type @name has been added.', ['@name' => $this->contentTypeName]));

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
   * Create a field on the content type created during setUp().
   *
   * @param string $field_name
   *   The storage field name to create.
   * @param string $type
   *   The storage field type to create.
   * @param string $widget_type
   *   The widget to use when editing this field.
   * @param string $fieldFormatter
   *   The formatter to use when editing this field.
   * @param string $allowed_bundles
   *   The allowed_bundles to use when editing this field.
   *
   * @return string
   *   Name of the field, like field_something
   */
  protected function createField($field_name, $type, $widget_type, $fieldFormatter, $allowed_bundles) {
    $assert = $this->assertSession();
    $this->drupalGet('admin/structure/types/manage/' . $this->contentTypeName . '/fields/add-field');

    // Fill out the field form.
    $edit = [
      'new_storage_type' => $type,
      'field_name' => $field_name,
      'label' => $field_name,
    ];
    $this->submitForm($edit, 'Save and continue');

    /* NOTE: We need a cardinality because it is an input field. */

    $edit = [
      'cardinality' => 'number',
      'cardinality_number' => 1,
      'settings[target_type]' => 'node',
    ];

    // And now we save the field settings.
    $this->submitForm($edit, 'Save field settings');

    $assert->pageTextContains((string) new FormattableMarkup('Updated field @name field settings.', ['@name' => $field_name]));

    // Try to select the cgov_unpublished handler.
    $fieldName = 'node.' . $this->contentTypeName . '.field_' . $field_name;
    $this->drupalGet('admin/structure/types/manage/' . $this->contentTypeName . '/fields/' . $fieldName);
    $edit = [
      'settings[handler]' => 'cgov_unpublished',
    ];
    $this->submitForm($edit, 'Change handler');
    $edit = [
      'settings[handler_settings][allowed_bundles]' => $allowed_bundles,
    ];
    $this->submitForm($edit, 'Save settings');
    $assert->pageTextContains((string) new FormattableMarkup('Saved @name configuration.', ['@name' => $field_name]));

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

  /**
   * Tests that the Entity Reference Selection plugin.
   */
  public function testEntityReferenceSelection() {
    $this->setupAndAssertForTests();
    $assert = $this->assertSession();

    // Create Entity Reference Selection field with valid allowed_bundles.
    $allowed_bundles = ['page', 'article'];
    $allowed_bundles = implode("\r\n", $allowed_bundles);
    $this->fieldName = $this->createField('eref_valid_bundles', 'entity_reference', 'options_select', 'entity_reference_label', $allowed_bundles);
    // Create article published node.
    $article_node = Node::create([
      'type' => 'article',
      'title' => $this->randomMachineName(),
      'uid' => '1',
      'status' => 1,
    ]);
    $article_node->save();
    $article_node_id = $article_node->id();
    $article_title = $article_node->getTitle();

    // Create an Entity Reference Selection node.
    $this->drupalGet('node/add/' . $this->contentTypeName);
    // Details to be submitted for content creation.
    $title = $this->randomMachineName(20);
    $edit = [
      'title[0][value]' => $title,
      'field_' . $this->fieldName => $article_node_id,
    ];
    // Submit the content creation form.
    $this->submitForm($edit, 'Save');
    $assert->pageTextContains((string) new FormattableMarkup(
      '@type @title has been created',
      ['@type' => $this->contentTypeName, '@title' => $title]
    ));
    $assert->pageTextContains((string) new FormattableMarkup(
      '@article_title',
      ['@article_title' => $article_title]
    ));

    // Create Entity Reference Selection field with no allowed_bundles.
    $allowed_bundles = [];
    $allowed_bundles = implode("\r\n", $allowed_bundles);
    $this->fieldName = $this->createField('eref_no_bundles', 'entity_reference', 'options_select', 'entity_reference_label', $allowed_bundles);

    // Create an Entity Reference Selection node.
    $this->drupalGet('node/add/' . $this->contentTypeName);
    // Details to be submitted for content creation.
    $title = $this->randomMachineName(20);
    $edit = [
      'title[0][value]' => $title,
      'field_' . $this->fieldName => $article_node_id,
    ];
    // Submit the content creation form.
    $this->submitForm($edit, 'Save');
    $assert->pageTextContains((string) new FormattableMarkup(
      '@type @title has been created',
      ['@type' => $this->contentTypeName, '@title' => $title]
    ));
    $assert->pageTextContains((string) new FormattableMarkup(
      '@article_title',
      ['@article_title' => $article_title]
    ));

    // Create Entity Reference Selection field with invalid allowed_bundles.
    $allowed_bundles = ['chicken'];
    $allowed_bundles = implode("\r\n", $allowed_bundles);
    $this->fieldName = $this->createField('eref_invalid_bundles', 'entity_reference', 'options_select', 'entity_reference_label', $allowed_bundles);

  }

}
