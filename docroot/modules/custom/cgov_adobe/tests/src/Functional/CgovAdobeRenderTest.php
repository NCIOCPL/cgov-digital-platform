<?php

namespace Drupal\Tests\cgov_adobe\Functional;

use Drupal\Component\Render\FormattableMarkup;
use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Test the ability for cgov_adobe to render launch tags.
 *
 * @group cgov_adobe
 */
class CgovAdobeRenderTest extends BrowserTestBase {

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
    'cgov_adobe',
  ];

  /**
   * The installation profile to use with this test.
   *
   * @var string
   */
  protected $profile = 'minimal';

  /**
   * The theme to use with this test.
   *
   * @var string
   */
  protected $defaultTheme = 'classy';

  /**
   * The content type name.
   *
   * @var string
   */
  protected $contentTypeName;

  /**
   * The author account.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $authorAccount;

  /**
   * The administrator account.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $administratorAccount;

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
      'administer cgov adobe',
      'access administration pages',
      'administer url aliases',
      'administer site configuration',
    ];
    $this->administratorAccount = $this->drupalCreateUser($permissions);
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
   * Tests the Cgov Adobe module.
   */
  public function testCgovAdobe() {
    /*
     * Setup Data.
     */

    // Login with Author user for content creation.
    $this->drupalLogin($this->authorAccount);

    $nodedetails = [];
    for ($i = 0; $i < 4; $i++) {
      $title_base = $this->randomMachineName(20);
      $alias_base = $this->randomMachineName(10);
      $detail = [
        'title' => $title_base . '-' . $i,
        'alias' => '/' . $alias_base . '-' . $i,
      ];
      $nodedetails[$i] = $detail;

      $this->drupalGet('node/add/' . $this->contentTypeName);
      // Details to be submitted for content creation.
      $edit = [
        'title[0][value]' => $detail['title'],
        'path[0][alias]' => $detail['alias'],
      ];
      // Submit the content creation form.
      $this->submitForm($edit, 'Save');
    }
    $this->drupalGet('node/add/' . $this->contentTypeName);

    /* Set Adobe Config */
    $this->drupalLogin($this->administratorAccount);

    // Setup Adobe Config.
    $this->drupalGet(Url::fromRoute('cgov_adobe.settings_form'));
    $this->submitForm(
      [
        'enabled' => 1,
        'launch_property_build_url' => '//example.org/launch.js',
        'exclude_paths' => "/node/2\n" . strtolower($nodedetails[2]['alias']),
      ],
      'Save configuration'
    );

    /*
     * Test Scenarios
     */
    $this->doTestConfig($nodedetails);
    $this->doTestPathFilters($nodedetails);
    $this->doTestEnables($nodedetails);
    $this->doTestNoPaths($nodedetails);
  }

  /**
   * Tests the inital config object.
   */
  private function doTestConfig($nodedetails) {
    $initialConfig = $this->config('cgov_adobe.settings');
    $this->assertEquals($initialConfig->get('enabled'), TRUE, 'Enabled saved correctly in initial config');
    $this->assertEquals($initialConfig->get('launch_property_build_url'), '//example.org/launch.js', 'Property URL saved correctly in initial config');
    $this->assertEquals(
      $initialConfig->get('exclude_paths'),
      [
        '/node/2',
        strtolower($nodedetails[2]['alias']),
      ],
      'Exclude Paths saved correctly in initial config'
    );
  }

  /**
   * Tests the path filters.
   */
  private function doTestPathFilters($nodedetails) {
    $assert = $this->assertSession();

    // Tags are loaded on an allowed path.
    $this->drupalGet('/node/1');
    $script_file_el = $assert->elementExists('css', 'script#cgov-adobe-url');
    $actual_script_src = $script_file_el->getAttribute('src');
    $this->assertEquals('//example.org/launch.js', $actual_script_src);
    $assert->elementExists('css', 'script#cgov-adobe-bottom');

    // Tags are loaded on an allowed path.
    $this->drupalGet($nodedetails[0]['alias']);
    $script_file_el = $assert->elementExists('css', 'script#cgov-adobe-url');
    $actual_script_src = $script_file_el->getAttribute('src');
    $this->assertEquals('//example.org/launch.js', $actual_script_src);
    $assert->elementExists('css', 'script#cgov-adobe-bottom');

    // Excluded the route based on excluded route.
    $this->drupalGet('/node/2');
    $assert->elementNotExists('css', 'script#cgov-adobe-url');
    $assert->elementNotExists('css', 'script#cgov-adobe-bottom');

    // Excluded the alias based on excluded route.
    $this->drupalGet($nodedetails[1]['alias']);
    $assert->elementNotExists('css', 'script#cgov-adobe-url');
    $assert->elementNotExists('css', 'script#cgov-adobe-bottom');

    // Exclude the alias based on excluded alias.
    $this->drupalGet($nodedetails[2]['alias']);
    $assert->elementNotExists('css', 'script#cgov-adobe-url');
    $assert->elementNotExists('css', 'script#cgov-adobe-bottom');

    // Exclude the route based on the path alias.
    $this->drupalGet('/node/3');
    $assert->elementNotExists('css', 'script#cgov-adobe-url');
    $assert->elementNotExists('css', 'script#cgov-adobe-bottom');
  }

  /**
   * Tests the enables setting.
   *
   * This also happens to test the cache tag clearing on save of the config.
   * During testing it was noticed that we had to clear the cache because
   * the save of the config was not changing the rendered pages.
   */
  private function doTestEnables($nodedetails) {
    $assert = $this->assertSession();
    $this->drupalLogin($this->administratorAccount);

    // Setup Adobe Config.
    $this->drupalGet(Url::fromRoute('cgov_adobe.settings_form'));
    $this->submitForm(
      [
        'enabled' => 0,
        'launch_property_build_url' => '//example.org/launch.js',
        'exclude_paths' => "/node/2\n" . strtolower($nodedetails[2]['alias']),
      ],
      'Save configuration'
    );

    // The settings are disabled, so no nodes should have the tags.
    $this->drupalGet('/node/1');
    $assert->elementNotExists('css', 'script#cgov-adobe-url');
    $assert->elementNotExists('css', 'script#cgov-adobe-bottom');
  }

  /**
   * Tests the enables setting.
   */
  private function doTestNoPaths($nodedetails) {
    $assert = $this->assertSession();
    $this->drupalLogin($this->administratorAccount);

    // Setup Adobe Config.
    $this->drupalGet(Url::fromRoute('cgov_adobe.settings_form'));
    $this->submitForm(
      [
        'enabled' => 1,
        'launch_property_build_url' => '//example.org/launch.js',
        'exclude_paths' => "",
      ],
      'Save configuration'
    );

    // Exclude the route based on the path alias.
    $this->drupalGet('/node/3');
    $script_file_el = $assert->elementExists('css', 'script#cgov-adobe-url');
    $actual_script_src = $script_file_el->getAttribute('src');
    $this->assertEquals('//example.org/launch.js', $actual_script_src);
    $assert->elementExists('css', 'script#cgov-adobe-bottom');
  }

}
