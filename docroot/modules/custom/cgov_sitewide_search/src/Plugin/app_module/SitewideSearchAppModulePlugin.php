<?php

namespace Drupal\cgov_sitewide_search\Plugin\app_module;

use Drupal\app_module\Plugin\app_module\AppModulePluginBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * Sitewide Search App Module Plugin.
 *
 * @AppModulePlugin(
 *   id = "cgov_sitewide_search_app_module_plugin",
 *   label = @Translation("Sitewide Search App Module Plugin")
 * )
 */
class SitewideSearchAppModulePlugin extends AppModulePluginBase {

  /**
   * {@inheritdoc}
   */
  protected function matchRouteInternal(array $path_components, array $options = []) {
    if (count($path_components) != 0) {
      // If we return anything in addition to the default path,
      // then we have entered an invalid URL.
      return NULL;
    }
    else {
      return [
        'app_module_route' => '/',
        'params' => [],
      ];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getAppRouteId($path, array $options = []) {
    // There is only one route.
    return 'default';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForRoute($path, array $options = []) {
    $build = [
      '#markup' => "",
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfoForRoute($path, array $options = []) {
    $meta = new CacheableMetadata();

    $meta
      ->setCacheTags(['cgov_sitewide_search_app_module_plugin']);

    return $meta;
  }

}
