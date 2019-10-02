<?php

namespace Drupal\Tests\app_module\Functional;

use Drupal\Component\Render\FormattableMarkup;

/**
 * Test the basic functionality of a app module node to load.
 *
 * This is pretty much the field formatter test except we are
 * going to use an alias and try some different gets.
 */
class AppModuleRouteTest extends AppModuleFieldBrowserTestBase {

  /**
   * Field example scenario tests.
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
      'path[0][alias]' => '/test/path',
    ];

    // Submit the content creation form.
    $this->drupalPostForm(NULL, $edit, 'Save');
    $assert->pageTextContains((string) new FormattableMarkup('@type @title has been created', ['@type' => $this->contentTypeName, '@title' => $title]));

    // Verity the web page is displaying the formatter. NOTE: Our formatter
    // right now just spits out the machine id of the app module.
    $assert->pageTextContains('App Module: Test App Module Plugin');

    /* --------------------------------------
     * There is some issue where the path processor
     * is not firing. I don't know if it is minimal
     * kernel or what. TODO: Test routing.
     * --------------------------------------
     */
  }

}
