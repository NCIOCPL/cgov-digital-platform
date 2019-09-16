<?php

namespace Drupal\Tests\app_module\Functional;

use Drupal\Component\Render\FormattableMarkup;

/**
 * Test the basic funtionality of the AppModuleReferenceSelectWidget.
 *
 * Create a content type with a field_application_module field, configure
 * it with the app_module_reference_select, create a node and check for
 * correct values.
 *
 * This is pretty much an exact copy of the formatter test. HOWEVER, in
 * the future when we have settings plugins, this should test the ability
 * to select an app module. Change its settings. Change the app module and
 * make sure the the previous settings were cleared out. Etc.
 */
class AppModuleReferenceSelectWidgetTest extends AppModuleFieldBrowserTestBase {

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

    // Verify the web page is displaying the formatter.
    $assert->pageTextContains('App Module: Test App Module Plugin');
  }

}
