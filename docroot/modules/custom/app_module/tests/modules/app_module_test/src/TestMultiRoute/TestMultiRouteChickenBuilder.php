<?php

namespace Drupal\app_module_test\TestMultiRoute;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * Chicken route builder for Testing multi route app module plugin.
 */
class TestMultiRouteChickenBuilder extends MultiRouteAppModuleBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'chicken';
  }

  /**
   * {@inheritdoc}
   */
  public function build(array $options) {
    $build = [
      '#markup' => "<div>Test Multiroute: Chicken</div>",
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfo(array $options) {
    $meta = new CacheableMetadata();
    $meta
      ->setCacheContexts(["url.query_args:chicken_param"])
      ->setCacheTags(['test_multi_route_app_module_plugin', "test_multi_route_app_module_plugin:chicken"])
      ->setCacheMaxAge(100);
    return $meta;
  }

}
