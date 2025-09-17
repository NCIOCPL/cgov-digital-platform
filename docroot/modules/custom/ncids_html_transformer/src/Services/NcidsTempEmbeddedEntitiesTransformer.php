<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Preprocessing-only transformer for callout boxes.
 */
class NcidsTempEmbeddedEntitiesTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  public function preProcessHtml(string $html): string {
    if (empty(trim($html))) {
      return $html;
    }

    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    /* Find all drupal-entity elements */
    $elements = $xpath->query('//drupal-entity');

    foreach ($elements as $element) {
      /** @var \DOMElement $element */
      $element->setAttribute('data-html-transformer', 'drupal-entity');
    }

    return Html::serialize($dom);
  }

}
