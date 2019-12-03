<?php

namespace Drupal\cgov_cts\MultiRouteBuilders;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase;
use Drupal\Core\Cache\CacheableMetadata;

/**
 * Route builder base for CTS.
 */
class CTSBuilderBase extends MultiRouteAppModuleBuilderBase {

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
      ->setCacheTags(['cgov_cts_app']);

    return $meta;
  }

  /**
   * {@inheritdoc}
   *
   * On the base builder, alter the dcterms_coverage meta tag
   * to include nciclinicaltrials for analytics.
   */
  public function alterPageAttachments(array &$attachments, array $options = []) {
    foreach ($attachments['#attached']['html_head'] as $delta => $tag) {
      if (isset($tag[1]) && $tag[1] == 'dcterms_coverage') {
        $attachments['#attached']['html_head'][$delta][0]['#attributes']['content'] = 'nciglobal,ncienterprise,nciclinicaltrials';
      }
    }
  }

  /**
   * {@inheritdoc}
   *
   * Return an array of tokens to alter. On the base builder,
   * do not return any tokens.
   */
  public function getTokensForAltering(array $options = []) {
    return [];
  }

}
