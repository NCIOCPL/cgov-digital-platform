<?php

namespace Drupal\app_module_test\TestMultiRoute;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * Chicken route builder for Testing multi route app module plugin.
 */
class TestMultiRouteDefaultBuilder extends MultiRouteAppModuleBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'default';
  }

  /**
   * {@inheritdoc}
   */
  public function build(array $options) {
    $build = [
      '#markup' => "<div>Test Multiroute: Default</div>",
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfo(array $options) {
    $meta = new CacheableMetadata();
    $meta
      ->setCacheTags(['test_multi_route_app_module_plugin'])
      ->setCacheMaxAge(50);
    return $meta;
  }

}
