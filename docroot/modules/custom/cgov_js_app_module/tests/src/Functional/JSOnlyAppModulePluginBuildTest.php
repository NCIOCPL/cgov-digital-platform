<?php

namespace Drupal\Tests\cgov_js_app_module\Functional;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Tests\BrowserTestBase;

/**
 * Test the JS Only App Module plugin base.
 *
 * @group cgov_js_app_module
 * @group cgov-digital-platform
 */
class JSOnlyAppModulePluginBuildTest extends BrowserTestBase {

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
    'datetime',
    'field',
    'link',
    'options',
    'path',
    'text',
    'user',
    'app_module',
    'cgov_js_app_module',
  ];

  /**
   * The app module id.
   *
   * @var string
   */
  protected $appModuleId;

  /**
   * The installation profile to use with this test.
   *
   * We need the 'cgov_site' profile because we are within that profile.
   *
   * @var string
   */
  protected $profile = 'minimal';

  /**
   * These are a set of default options for the plugin methods.
   *
   * Copy the array and make changes for your tests. This way you
   * don't have to keep typing them over and over. Rememberm array
   * assignment in PHP is copy by value.
   *
   * @var array
   */
  protected $defaultOptions = [
    "drupalConfig" => [
      "appName" => "test-app",
      "rootId" => "NCI-app-root",
      "initFnName" => "window.TestApp",
      "appCssUri" => "https://example.org/test-app/test-app.vX.Y.Z.css",
      "appJsUri" => "https://example.org/test-app/test-app.vX.Y.Z.js",
      "removeHeadElements" => [],
      "validAppPaths" => [],
    ],
    "frontEndConfig" => [
      "testKey1" => "testValue",
      "testKey2" => "testKey2",
    ],
  ];

  /**
   * {@inheritDoc}
   */
  protected function setUp() {
    // Create a field, create a node type.
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

    // Prepare a new content type where the field will be added.
    $this->drupalGet('admin/structure/types/add');
    $edit = [
      'name' => 'JS Application Page',
      'type' => 'js_app_page',
    ];
    $this->drupalPostForm(NULL, $edit, 'Save and manage fields');
    $this->assertText((string) new FormattableMarkup('The content type @name has been added.', ['@name' => 'JS Application Page']));

    // Add an app module reference.
    $this->createField();

    // Now that we have a new content type, create a user that has privileges
    // on the content type.
    $this->authorAccount = $this->drupalCreateUser([
      'create js_app_page content',
      'edit any js_app_page content',
      'create url aliases',
    ]);

    // Login with Author user for content creation.
    $this->drupalLogin($this->authorAccount);
  }

  /**
   * Test function for testing rendering of app module.
   *
   * ACTUAL TEST HERE!
   */
  public function testBuild() {

    // Simple test without any literals or tokens.
    $simple_test_options = $this->defaultOptions;

    //phpcs:disable Drupal.Strings.UnnecessaryStringConcat.Found
    $simple_test_expected_config =
      "\t\"testKey1\": \"testValue\", " .
      "\t\"testKey2\": \"testKey2\", " .
      "\t\"baseHost\": \"http://simpletest\", " .
      "\t\"basePath\": \"/node/1\", " .
      "\t\"canonicalHost\": \"http://simpletest\", " .
      "\t\"language\": \"en\", " .
      "\t\"rootId\": \"NCI-app-root\" ";
    //phpcs:enable

    $this->internalTestApage(
      $simple_test_options,
      $this->randomMachineName(20),
      'window.TestApp(window.NCI_app_root_js_config)',
      $simple_test_expected_config
    );

    // Literal Test.
    $literal_test_options = $this->defaultOptions;
    $literal_test_options['frontEndConfig'] = [
      "testKey1" => "@@LITERAL@@window.test_var",
    ];
    //phpcs:disable Drupal.Strings.UnnecessaryStringConcat.Found
    $literal_test_expected_config =
      "\t\"testKey1\": window.test_var, " .
      "\t\"baseHost\": \"http://simpletest\", " .
      "\t\"basePath\": \"/node/2\", " .
      "\t\"canonicalHost\": \"http://simpletest\", " .
      "\t\"language\": \"en\", " .
      "\t\"rootId\": \"NCI-app-root\" ";
    //phpcs:enable

    $this->internalTestApage(
      $literal_test_options,
      $this->randomMachineName(20),
      'window.TestApp(window.NCI_app_root_js_config)',
      $literal_test_expected_config
    );

    // Token Test.
    $token_test_options = $this->defaultOptions;
    $token_test_options['frontEndConfig'] = [
      "title" => "@@TOKEN@@[node:title]",
    ];

    //phpcs:disable Drupal.Strings.UnnecessaryStringConcat.Found
    $token_test_expected_config =
      "\t\"title\": \"DUNNO\", " .
      "\t\"baseHost\": \"http://simpletest\", " .
      "\t\"basePath\": \"/node/3\", " .
      "\t\"canonicalHost\": \"http://simpletest\", " .
      "\t\"language\": \"en\", " .
      "\t\"rootId\": \"NCI-app-root\" ";
    //phpcs:enable

    $this->internalTestApage(
      $token_test_options,
      "DUNNO",
      'window.TestApp(window.NCI_app_root_js_config)',
      $token_test_expected_config
    );

    // Correct Objects and Nested test.
    // NOTE: Under the hood, @@NOENCODE@@ is used for URLS,
    // and therefore gets tested.
    $type_test_options = $this->defaultOptions;
    $type_test_options['frontEndConfig'] = [
      "tokenTest" => "@@TOKEN@@[node:title]",
      "literalTest" => "@@LITERAL@@window.foo",
      "boolTest" => TRUE,
      "intTest" => 5,
      "floatTest" => 10.5,
      "stringTest" => "imastring",
      "nullTest" => NULL,
      "arrayTest" => [
        1,
        "string",
        TRUE,
        "@@TOKEN@@[node:title]",
        "@@LITERAL@@window.foo",
        NULL,
      ],
      "nestedObject" => [
        "tokenTest" => "@@TOKEN@@[node:title]",
        "literalTest" => "@@LITERAL@@window.foo",
        "boolTest" => TRUE,
        "intTest" => 5,
        "floatTest" => 10.5,
        "stringTest" => "imastring",
        "nullTest" => NULL,
        "arrayTest" => [
          1,
          "string",
          TRUE,
          "@@TOKEN@@[node:title]",
          "@@LITERAL@@window.foo",
          NULL,
        ],
        "superNested" => [
          "key" => "value",
        ],
      ],
    ];

    //phpcs:disable Drupal.Strings.UnnecessaryStringConcat.Found
    $type_test_expected_config =
      "\t\"tokenTest\": \"DUNNO\", " .
      "\t\"literalTest\": window.foo, " .
      "\t\"boolTest\": true, " .
      "\t\"intTest\": 5, " .
      "\t\"floatTest\": 10.5, " .
      "\t\"stringTest\": \"imastring\", " .
      "\t\"nullTest\": null, " .
      "\t\"arrayTest\": [1,\"string\",true,\"DUNNO\",window.foo,null], " .
      "\t\"nestedObject\": { " .
        "\t\"tokenTest\": \"DUNNO\", " .
        "\t\"literalTest\": window.foo, " .
        "\t\"boolTest\": true, " .
        "\t\"intTest\": 5, " .
        "\t\"floatTest\": 10.5, " .
        "\t\"stringTest\": \"imastring\", " .
        "\t\"nullTest\": null, " .
        "\t\"arrayTest\": [1,\"string\",true,\"DUNNO\",window.foo,null], " .
        "\t\"superNested\": { \t\"key\": \"value\" } " .
      "}, " .
      "\t\"baseHost\": \"http://simpletest\", " .
      "\t\"basePath\": \"/node/4\", " .
      "\t\"canonicalHost\": \"http://simpletest\", " .
      "\t\"language\": \"en\", " .
      "\t\"rootId\": \"NCI-app-root\" ";
    //phpcs:enable

    $this->internalTestApage(
      $type_test_options,
      "DUNNO",
      'window.TestApp(window.NCI_app_root_js_config)',
      $type_test_expected_config
    );

    // Route test with additional routes.
    $route_test_options = $this->defaultOptions;
    $route_test_options['validAppPaths'] = [
      "\\/path\\/.*",
    ];

    //phpcs:disable Drupal.Strings.UnnecessaryStringConcat.Found
    $route_test_expected_config =
      "\t\"testKey1\": \"testValue\", " .
      "\t\"testKey2\": \"testKey2\", " .
      "\t\"baseHost\": \"http://simpletest\", " .
      "\t\"basePath\": \"/node/5\", " .
      "\t\"canonicalHost\": \"http://simpletest\", " .
      "\t\"language\": \"en\", " .
      "\t\"rootId\": \"NCI-app-root\" ";
    //phpcs:enable

    $this->internalTestApage(
      $route_test_options,
      $this->randomMachineName(20),
      'window.TestApp(window.NCI_app_root_js_config)',
      $route_test_expected_config
    );

  }

  /**
   * This tests a single page to ensure the correct head items are in place.
   *
   * @param array $options
   *   The module instance options.
   * @param string $node_title
   *   The title of the node to create.
   * @param string $expected_onload_script
   *   The initialize call.
   * @param string $expected_config
   *   The expected config as a string.
   */
  private function internalTestApage(
    array $options,
    $node_title,
    $expected_onload_script,
    $expected_config
  ) {
    // Create the page, which will redirect to the page.
    $this->addNode($node_title, $options);

    $assert = $this->assertSession();

    $rootId = $options['drupalConfig']['rootId'];

    /* The CSS Test fails, we have had issues with some of the theme hooks
     * running in Functional tests. The code is below if we can fix that
     * other issue.
     * $assert->elementExists(
     *   'css',
     *   'link[href="' . $options['drupalConfig']['appCssUri'] . '"]'
     * );
     */

    // Test the script file tag.
    $script_file_el = $assert->elementExists('css', 'script#' . $rootId . '-js-file');
    $actual_script_src = $script_file_el->getAttribute('src');
    $this->assertEquals($options['drupalConfig']['appJsUri'], $actual_script_src);
    $actual_script_onload = $script_file_el->getAttribute('onload');
    $this->assertEquals($expected_onload_script, $actual_script_onload);

    // Test the script configuration.
    $script_config_el = $assert->elementExists('css', 'script#' . $rootId . '-js-config');
    $actual_script_config = $script_config_el->getText();
    $full_expected_config = "(function() { window." . str_replace("-", "_", $rootId) . "_js_config = { " . $expected_config . "}; })();";
    // So in pipelines the test URL will not be simpletest, so we need to
    // replace it.
    $this->assertEquals($full_expected_config, str_replace("http://127.0.0.1", "http://simpletest", $actual_script_config));

    // Test that the app root exists.
    $assert->elementExists('css', 'div#' . $rootId);

  }

  /**
   * Create a field on the content type created during setUp().
   *
   * @param string $content_type
   *   The content type to add the field to.
   * @param string $field_name
   *   The name of the field to attach.
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
  protected function createField(
    $content_type = 'js_app_page',
    $field_name = 'js_app_module',
    $type = 'app_module_reference',
    $widget_type = 'app_module_reference_select',
    $fieldFormatter = 'app_module_reference_formatter'
  ) {
    $assert = $this->assertSession();

    $this->drupalGet('admin/structure/types/manage/' . $content_type . '/fields');

    // Go to the 'Add field' page.
    $this->clickLink('Add field');

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
    $this->drupalGet('admin/structure/types/manage/' . $content_type . '/form-display');
    $edit = [
      'fields[field_' . $field_name . '][type]' => $widget_type,
    ];
    $this->drupalPostForm(NULL, $edit, 'Save');

    // Set the field formatter for the newly created field.
    $this->drupalGet('admin/structure/types/manage/' . $content_type . '/display');
    $edit1 = [
      'fields[field_' . $field_name . '][type]' => $fieldFormatter,
    ];
    $this->drupalPostForm(NULL, $edit1, 'Save');

    return $field_name;
  }

  /**
   * Adds a new JS App Module node to the system.
   *
   * @param string $node_title
   *   The node title.
   * @param array $instance_config
   *   The app module instance config.
   */
  protected function addNode($node_title, array $instance_config) {
    $assert = $this->assertSession();

    $this->drupalGet('node/add/js_app_page');

    // Details to be submitted for content creation.
    $edit = [
      'title[0][value]' => $node_title,
      'field_js_app_module[0][target_id]' => 'cgov_js_only_app',
      'edit-field-js-app-module-0-data' => json_encode($instance_config),
    ];

    // Submit the content creation form.
    $this->drupalPostForm(NULL, $edit, 'Save');
    $assert->pageTextContains((string) new FormattableMarkup('@type @title has been created', [
      '@type' => 'JS Application Page',
      '@title' => $node_title,
    ]));
  }

}
