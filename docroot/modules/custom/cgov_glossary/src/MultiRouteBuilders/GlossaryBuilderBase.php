<?php

namespace Drupal\cgov_glossary\MultiRouteBuilders;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * Route builder base for glossary.
 */
class GlossaryBuilderBase extends MultiRouteAppModuleBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
  }

  /**
   * {@inheritdoc}
   */
  public function build(array $options) {
    $build = [
      '#markup' => '<noscript>You need to enable JavaScript to run this app.</noscript>',
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfo(array $options) {
    $meta = new CacheableMetadata();
    $meta
      ->setCacheTags(['cgov_glossary_app']);

    return $meta;
  }

}
