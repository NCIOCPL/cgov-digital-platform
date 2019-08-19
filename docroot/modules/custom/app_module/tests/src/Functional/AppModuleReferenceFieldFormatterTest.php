<?php

namespace Drupal\Tests\app_module\Functional;

use Drupal\Component\Render\FormattableMarkup;

/**
 * Test the basic funtionality of the AppModuleReferenceFieldFormatter.
 *
 * Create a content type with a field_application_module field, configure
 * it with the app_module_reference_select widget, and create a node and check
 * for correct values on the rendered page.
 */
class AppModuleReferenceFieldFormatterTest extends AppModuleFieldBrowserTestBase {

  /**
   * Field example scenario tests.
   *
   * The following scenarios:
   * - Creates a content type.
   * - Adds a field_application_module to it.
   * - Creates a node of the new type.
   * - Populates the field with an app module.
   * - Tests the result.
   */
  public function testField() {
    $assert = $this->assertSession();
    // Login with Admin and create a field.
    $this->drupalLogin($this->administratorAccount);
    $this->fieldName = $this->createField();

    // Login with Author user for content creation.
    $this->drupalLogin($this->authorAccount);
    $this->drupalGet('node/add/' . $this->contentTypeName);

    // Details to be submitted for content creation.
    $title = $this->randomMachineName(20);
    $edit = [
      'title[0][value]' => $title,
      'field_' . $this->fieldName . '[0][target_id]' => $this->appModuleId,
    ];

    // Submit the content creation form.
    $this->drupalPostForm(NULL, $edit, 'Save');
    $assert->pageTextContains((string) new FormattableMarkup('@type @title has been created', ['@type' => $this->contentTypeName, '@title' => $title]));

    // Verity the web page is displaying the formatter. NOTE: Our formatter
    // right now just spits out the machine id of the app module.
    // TODO: Fix this when we get real formatters.
    $assert->pageTextContains('App Module: ' . $this->appModuleId);
  }

}
