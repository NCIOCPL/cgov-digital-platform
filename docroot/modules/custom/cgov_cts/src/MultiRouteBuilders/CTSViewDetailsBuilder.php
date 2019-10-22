<?php

namespace Drupal\cgov_cts\MultiRouteBuilders;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * Default route builder for CTS - should just load React app.
 */
class CTSViewDetailsBuilder extends MultiRouteAppModuleBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'view_details';
  }

  /**
   * {@inheritdoc}
   */
  public function build(array $options) {
    $build = [
      '#markup' => "<div>This should hold Sarina's controller's build</div>",
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfo(array $options) {
    $meta = new CacheableMetadata();
    // TODO: Add protocol ID here.
    $meta
      ->setCacheTags(['cgov_cts_app']);
    return $meta;
  }

}
