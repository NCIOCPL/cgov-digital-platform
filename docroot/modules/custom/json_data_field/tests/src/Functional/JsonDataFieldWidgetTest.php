<?php

namespace Drupal\Tests\json_data_field\Functional;

use Drupal\Component\Render\FormattableMarkup;

/**
 * Test the basic funtionality of the JsonDataFieldWidget.
 *
 * Create a content type with a json_data_field field, configure
 * it with the yaml_textarea, create a node and check for
 * correct values.
 */
class JsonDataFieldWidgetTest extends JsonDataFieldBrowserTestBase {

  /**
   * Field example scenario tests.
   *
   * The following scenarios:
   * - Creates a content type.
   * - Adds a field_json_data_field to it.
   * - Creates a node of the new type.
   * - Populates the field with json_data_field.
   * - Tests the result.
   *
   * The formatter doesn't output anything, so we deliberately don't test
   * the result of rendering.
   */
  public function testField() {
    $this->setupAndAssertForTests();

    $assert = $this->assertSession();
    // Login with Admin and create a field.
    $this->drupalLogin($this->administratorAccount);
    $this->fieldName = $this->createField();

    // Login with Author user for content creation.
    $this->drupalLogin($this->authorAccount);
    $this->drupalGet('node/add/' . $this->contentTypeName);

    // Loading a YAML file or a YAML string.
    $yaml_file = \Drupal::service('extension.list.module')->getPath('json_data_field') . '/tests/JsonDataFieldTestData.yml';
    $yaml_data = file_get_contents($yaml_file);

    // Details to be submitted for content creation.
    $title = $this->randomMachineName(20);
    $edit = [
      'title[0][value]' => $title,
      'field_' . $this->fieldName . '[0][value]' => $yaml_data,
    ];

    // Submit the content creation form.
    $this->submitForm($edit, 'Save');
    $assert->pageTextContains((string) new FormattableMarkup(
      '@type @title has been created',
      ['@type' => $this->contentTypeName, '@title' => $title]
    ));

    // Test resave json_data_field.
    $node = $this->getNodeByTitle($title);
    $this->drupalGet('node/' . $node->id() . '/edit');
    $this->submitForm(
      [
        'field_' . $this->fieldName . '[0][value]' => $yaml_data,
      ],
      'Save'
    );

    // Check validation.
    $this->drupalGet('node/add/' . $this->contentTypeName);

    // Details to be submitted for content creation.
    $title = $this->randomMachineName(20);
    $edit = [
      'title[0][value]' => $title,
      'field_' . $this->fieldName . '[0][value]' => 'description: "This is a root level menu link" entity: menu_link_content',
    ];

    // Submit the content creation form.
    $this->submitForm($edit, 'Save');
    $assert->pageTextContains('Yaml Content must be valid YAML Data.');

  }

}
