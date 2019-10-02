<?php

namespace Drupal\app_module_test\Plugin\app_module;

use Drupal\app_module\Plugin\app_module\AppModulePluginBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * Test App Module Plugin.
 *
 * App Module used for discovery tests.
 *
 * @AppModulePlugin(
 *   id = "caching_app_module_plugin",
 *   label = @Translation("Caching App Module test Plugin")
 * )
 */
class CachingAppModulePlugin extends AppModulePluginBase {

  /**
   * {@inheritdoc}
   */
  protected function matchRouteInternal(array $path_components, array $options = []) {
    $route_info = NULL;

    if ($path_components[0] == 'chicken') {

      $route_info = [
        'app_module_route' => '/chicken',
        'params' => [],
      ];

    }

    // NOTE: If it is not a known path, then NULL will be returned as expected.
    // The default route with no params is handled by the AppModulePluginBase.
    return $route_info;
  }

  /**
   * {@inheritdoc}
   */
  public function getAppRouteId($path, array $options = []) {
    if ($path == '/chicken') {
      return 'chicken';
    }
    else {
      return 'default';
    }

  }

  /**
   * {@inheritdoc}
   */
  public function buildForRoute($path, array $options = []) {
    $build = [
      '#markup' => "<div>App Module: " . $this->pluginTitle() . " </div>",
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfoForRoute($path, array $options = []) {
    $meta = new CacheableMetadata();

    if ($path == '/chicken') {
      $meta
        ->setCacheContexts(["url.query_args:chicken_param"])
        ->setCacheTags(['caching_app_module_plugin', "caching_app_module_plugin:chicken"])
        ->setCacheMaxAge(100);
    }
    else {
      $meta
        ->setCacheTags(['caching_app_module_plugin'])
        ->setCacheMaxAge(50);
    }

    return $meta;
  }

}
