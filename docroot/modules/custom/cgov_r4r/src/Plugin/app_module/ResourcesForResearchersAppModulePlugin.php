<?php

namespace Drupal\cgov_r4r\Plugin\app_module;

use Drupal\app_module\Plugin\app_module\AppModulePluginBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * R4R App Module Plugin.
 *
 * @AppModulePlugin(
 *   id = "cgov_r4r_app_module_plugin",
 *   label = @Translation("R4R App Module Plugin")
 * )
 */
class ResourcesForResearchersAppModulePlugin extends AppModulePluginBase {

  /**
   * {@inheritdoc}
   */
  protected function matchRouteInternal(array $path_components, array $options = []) {
    switch ($path_components[0]) {
      case 'resource':
      case 'search':
        return [
          'app_module_route' => '/',
          'params' => [],
        ];

      default:
        // Not a known path.
        return NULL;
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
      ->setCacheTags(['cgov_r4r_app_module_plugin']);

    return $meta;
  }

}
