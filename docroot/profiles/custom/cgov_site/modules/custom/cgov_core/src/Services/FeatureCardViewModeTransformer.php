<?php

namespace Drupal\cgov_core\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer to replace feature card view mode.
 */
class FeatureCardViewModeTransformer implements HtmlTransformerInterface {

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    /* Find all elements with data-entity-embed-display containing "node.embedded_feature_card" */
    $nodes = $xpath->query('//*[@data-entity-embed-display and contains(@data-entity-embed-display, "node.embedded_feature_card")]');

    foreach ($nodes as $node) {
      /** @var \DOMElement $node */
      $display_attr = $node->getAttribute('data-entity-embed-display');
      /* Replace "node.embedded_feature_card" with "node.embedded_feature_card_no_image" */
      /* But avoid replacing "node.embedded_feature_card_no_image" (if it already exists). */
      $new_display_attr = preg_replace('/\bnode\.embedded_feature_card(?!_no_image)\b/', 'node.embedded_feature_card_no_image', $display_attr);
      $node->setAttribute('data-entity-embed-display', $new_display_attr);
    }

    return Html::serialize($dom);
  }

}
