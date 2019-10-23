<?php

namespace Drupal\cgov_cts\MultiRouteBuilders;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * Default route builder for CTS - should just load React app.
 */
class CTSDefaultBuilder extends MultiRouteAppModuleBuilderBase {

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
      '#markup' => "<div>TODO - Add App Wrapper Here</div>",
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfo(array $options) {
    $meta = new CacheableMetadata();
    $meta
      ->setCacheTags(['cgov_cts_app']);
    return $meta;
  }

}
