<?php

namespace Drupal\Tests\app_module\Functional;

use Drupal\app_module\Entity\AppModule;
use Drupal\Tests\BrowserTestBase;

/**
 * Test the Config Entity Example module.
 *
 * @group config_entity_example
 * @group examples
 *
 * @ingroup config_entity_example
 */
class AppModulePluginBaseTest extends BrowserTestBase {

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
   * Various functional test of the App Module Plugin Base.
   */
  public function testAppModule() {

    // Default URL.
    $this->evalEqual(
      '/',
      'test_app_module',
      [
        'app_module_path' => '/',
        'params' => [],
      ],
      "Test default route."
    );

    // Normal URL.
    $this->evalEqual(
      '/chicken',
      'test_multi_route_app_module',
      [
        'app_module_path' => '/chicken',
        'params' => [],
      ],
      "Test chicken no params"
    );

    // Normal URL with params.
    $this->evalEqual(
      '/chicken/1234',
      'test_multi_route_app_module',
      [
        'app_module_path' => '/chicken',
        'params' => [
          'id' => '1234',
        ],
      ],
      "Test chicken with id param"
    );

    // Test unknown route that returns NULL.
    $this->evalEqual(
      '/shrimp/1234',
      'test_multi_route_app_module',
      NULL,
      "Test unknown route"
    );
  }

  /**
   * Helper function.
   */
  private function evalEqual($app_module_path, $app_module, $expected, $message) {
    // Load the app module.
    $entity = AppModule::load($app_module);

    // Get the plugin.
    $plugin = $entity->getAppModulePlugin();

    // Get the match.
    $route_info = $plugin->matchRoute($app_module_path, []);

    // Assert equals.
    $this->assertEquals($route_info, $expected, $message, 0.0, 10, TRUE);
  }

}
