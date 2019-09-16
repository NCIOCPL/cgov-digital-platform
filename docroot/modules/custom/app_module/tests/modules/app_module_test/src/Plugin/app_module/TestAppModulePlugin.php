<?php

namespace Drupal\app_module_test\Plugin\app_module;

use Drupal\app_module\Plugin\app_module\AppModulePluginBase;

/**
 * Test App Module Plugin.
 *
 * App Module used for discovery tests.
 *
 * @AppModulePlugin(
 *   id = "test_app_module_plugin",
 *   label = @Translation("Test App Module Plugin")
 * )
 */
class TestAppModulePlugin extends AppModulePluginBase {

}
