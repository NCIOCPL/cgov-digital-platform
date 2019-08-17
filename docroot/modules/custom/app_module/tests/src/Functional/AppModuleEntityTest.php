<?php

namespace Drupal\Tests\app_module\Functional;

use Drupal\app_module\Entity\AppModule;
use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Test the Config Entity Example module.
 *
 * @group config_entity_example
 * @group examples
 *
 * @ingroup config_entity_example
 */
class AppModuleEntityTest extends BrowserTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['app_module', 'app_module_test'];

  /**
   * The installation profile to use with this test.
   *
   * We need the 'cgov_site' profile because we are within that profile.
   *
   * @var string
   */
  protected $profile = 'minimal';

  /**
   * Various functional test of the App Module module.
   *
   * 1) Verify that the Test App entity was created in the test app module.
   * 2) Verify that permissions are applied to the various defined paths.
   * 3) Verify that we can manage entities through the user interface.
   * 4) Verify that the entity we add can be re-edited.
   * 5) Verify that the label is shown in the list.
   */
  public function testAppModule() {
    $assert = $this->assertSession();

    // 1) Verify that the Test App Module entity was created when the module was
    // installed.
    $entity = AppModule::load('test_app_module');
    $this->assertNotNull($entity, 'test_app_module was created during installation.');

    // 2) Verify that permissions are applied to the various defined paths.
    // Define some paths. Since the Test App Module entity is defined,
    // we can use it in our test paths paths.
    $forbidden_paths = [
      '/admin/structure/app_module',
      '/admin/structure/app_module/add',
      '/admin/structure/app_module/test_app_module',
      '/admin/structure/app_module/test_app_module/delete',
    ];
    // Check each of the paths to make sure we don't have access. At this point
    // we haven't logged in any users, so the client is anonymous.
    foreach ($forbidden_paths as $path) {
      $this->drupalGet($path);
      $assert->statusCodeEquals(403);
    }

    // Create a user with no permissions.
    $noperms_user = $this->drupalCreateUser();
    $this->drupalLogin($noperms_user);
    // Should be the same result for forbidden paths, since the user needs
    // special permissions for these paths.
    foreach ($forbidden_paths as $path) {
      $this->drupalGet($path);
      $assert->statusCodeEquals(403);
    }

    // Create a user who can administer app modules.
    $admin_user = $this->drupalCreateUser([
      'administer app modules',
      'access toolbar',
      'access administration pages',
    ]);
    $this->drupalLogin($admin_user);
    // Forbidden paths aren't forbidden any more.
    foreach ($forbidden_paths as $unforbidden) {
      $this->drupalGet($unforbidden);
      $assert->statusCodeEquals(200);
    }

    // Now that we have the admin user logged in, check the menu links.
    $this->drupalGet('/admin/structure');
    $assert->linkByHrefExists('admin/structure/app_module');

    // 3) Verify that we can manage entities through the user interface.
    // We still have the admin user logged in, so we'll create, update, and
    // delete an entity.
    // Go to the list page.
    $this->drupalGet('/admin/structure/app_module');
    $this->clickLink('Add application module');
    $app_machine_name = 'my_app';
    $this->drupalPostForm(
      NULL,
      [
        'label' => $app_machine_name,
        'id' => $app_machine_name,
      ],
      'Save'
    );

    // 4) Verify that our app appears when we edit it.
    $this->drupalGet('/admin/structure/app_module/' . $app_machine_name);
    $assert->fieldExists('label');

    // 5) Verify that the label and machine name are shown in the list.
    $this->drupalGet('/admin/structure/app_module');
    $this->clickLink('Add application module');
    $app2_machine_name = 'app_module_2';
    $app2_label = 'App Module 2';
    $this->drupalPostForm(
      NULL,
      [
        'label' => $app2_label,
        'id' => $app2_machine_name,
      ],
      'Save'
    );
    $this->drupalGet('/admin/structure/app_module');
    $assert->pageTextContains($app2_machine_name);
    $assert->pageTextContains($app2_label);

    // Try to re-submit the same appmodule, and verify that we see an error
    // message and not a PHP error.
    $this->drupalPostForm(
      Url::fromRoute('entity.app_module.add_form'),
      [
        'label' => $app2_label,
        'id' => $app2_machine_name,
      ],
      'Save'
    );
    $assert->pageTextContains('The machine-readable name is already in use.');

    // 6) Verify that required links are present on respective paths.
    $this->drupalGet(Url::fromRoute('entity.app_module.collection'));
    $this->assertLinkByHref('/admin/structure/app_module/add');
    $this->assertLinkByHref('/admin/structure/app_module/app_module_2');
    $this->assertLinkByHref('/admin/structure/app_module/app_module_2/delete');

    // Verify links on Edit Robot.
    $this->drupalGet('/admin/structure/app_module/app_module_2');
    $this->assertLinkByHref('/admin/structure/app_module/app_module_2/delete');

    // Verify links on Delete Robot.
    $this->drupalGet('/admin/structure/app_module/app_module_2/delete');
    // List page will be the destination of the cancel link.
    $cancel_button = $this->xpath(
      '//a[@id="edit-cancel" and contains(@href, :path)]',
      [':path' => '/admin/structure/app_module']
    );
    $this->assertEqual(count($cancel_button), 1, 'Found cancel button linking to list page.');

  }

}
