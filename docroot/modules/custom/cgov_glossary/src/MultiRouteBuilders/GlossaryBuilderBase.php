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

  /**
   * {@inheritDoc}
   */
  public function alterPageAttachments(array &$attachments, array $options = []) {

    /* -----------
     * Remove head elements
     * -----------
     */
    $head_elements_to_remove = ['canonical_url', 'robots', 'title_tag'];

    $remove_head_indices = [];

    foreach ($attachments['#attached']['html_head'] as $delta => $tag) {
      if (in_array($tag[1], $head_elements_to_remove)) {
        $remove_head_indices[] = $delta;
      }
    }

    for ($i = (count($remove_head_indices) - 1); $i >= 0; $i--) {
      unset($attachments['#attached']['html_head'][$remove_head_indices[$i]]);
    }

    /* -----------
     * Remove hreflang links
     * -----------
     */
    $head_links_to_remove = ['alternate'];

    $remove_link_indices = [];

    // This applies to all of the views of this app module.
    foreach ($attachments['#attached']['html_head_link'] as $delta => $tag) {
      if (in_array($tag[0]["rel"], $head_links_to_remove)) {
        $remove_link_indices[] = $delta;
      }
    }

    for ($i = (count($remove_link_indices) - 1); $i >= 0; $i--) {
      unset($attachments['#attached']['html_head_link'][$remove_link_indices[$i]]);
    }
  }

}
