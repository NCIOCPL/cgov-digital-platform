<?php

namespace Drupal\Tests\app_module\Kernel;

use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the app_module_theme_suggestions_app_module() function.
 *
 * @group app_module
 */
class AppModuleTemplateSuggestionsTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  protected static $modules = [
    'app_module',
    'system',
  ];

  /**
   * Tests template suggestions from app_module_theme_suggestions_app_module().
   */
  public function testAppModuleThemeHookSuggestions() {
    $this->installConfig(['system']);

    $variables = [];
    $variables['elements']['#configuration'] = [];
    $variables['elements']['#app_module_id'] = 'test_multi_route_app_module';
    $variables['elements']['#app_module_plugin_id'] = 'test_multi_route_app_module_plugin';
    $variables['elements']['#app_route_id'] = 'chicken';
    $variables['elements']['content'] = [];
    $suggestions = app_module_theme_suggestions_app_module($variables);
    $this->assertSame([
      'app_module',
      'app_module__test_multi_route_app_module_plugin',
      'app_module__test_multi_route_app_module_plugin__chicken',
      'app_module__test_multi_route_app_module',
      'app_module__test_multi_route_app_module__test_multi_route_app_module_plugin',
      'app_module__test_multi_route_app_module__test_multi_route_app_module_plugin__chicken',
    ], $suggestions);
  }

}
