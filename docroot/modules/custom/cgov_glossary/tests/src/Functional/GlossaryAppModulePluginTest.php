<?php

namespace Drupal\Tests\cgov_glossary\Functional;

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
class GlossaryAppModulePluginTest extends BrowserTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['app_module', 'cgov_glossary'];

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
  public function testAppModuleRoutes() {

    // Default URL.
    $this->evalEqual(
      '/',
      'cgov_glossary_app',
      [
        'app_module_path' => '/',
        'params' => [],
      ],
      "Test default route."
    );

    // Expand URL with params - English.
    $this->evalEqual(
      '/expand/a',
      'cgov_glossary_app',
      [
        'app_module_path' => '/expand',
        'params' => [
          'expandChar' => 'a',
        ],
      ],
      "Test expand with expandChar param"
    );

    // Search URL with params - English.
    $this->evalEqual(
      '/search/meta',
      'cgov_glossary_app',
      [
        'app_module_path' => '/search',
        'params' => [
          'searchText' => 'meta',
        ],
      ],
      "Test search with searchText param"
    );

    // Definition URL with params.
    $this->evalEqual(
      '/def/metastatic',
      'cgov_glossary_app',
      [
        'app_module_path' => '/def',
        'params' => [
          'idorname' => 'metastatic',
        ],
      ],
      "Test definition with idorname param"
    );

    // Expand URL with params - Spanish.
    $this->evalEqual(
      '/ampliar/a',
      'cgov_glossary_app',
      [
        'app_module_path' => '/ampliar',
        'params' => [
          'expandChar' => 'a',
        ],
      ],
      "Test ampliar with expandChar param"
    );

    // Search URL with params - Spanish.
    $this->evalEqual(
      '/buscar/meta',
      'cgov_glossary_app',
      [
        'app_module_path' => '/buscar',
        'params' => [
          'searchText' => 'meta',
        ],
      ],
      "Test buscar with searchText param"
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
