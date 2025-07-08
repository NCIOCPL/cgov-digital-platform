<?php

namespace Drupal\cgov_core\Services;

use Drupal\Component\Utility\Html;

/**
 * Page Options Manager Service.
 */
class RemoveImageCarouselTransformer implements HtmlTransformerInterface {

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);
    $nodes = $xpath->query('//*[@class and contains(concat(" ", normalize-space(@class), " "), " ic-carousel ")]');

    foreach ($nodes as $node) {
      /** @var \DOMElement $node */
      $class_attr = $node->getAttribute('class');

      /* Remove ic-carousel class */
      $new_class_attr = preg_replace('/\bic-carousel\b/', '', $class_attr);

      /* Clean up extra spaces and trim */
      $new_class_attr = preg_replace('/\s+/', ' ', trim($new_class_attr));

      /* If the class attribute is empty after removal, remove the entire attribute */
      if (empty($new_class_attr)) {
        $node->removeAttribute('class');
      }
      else {
        $node->setAttribute('class', $new_class_attr);
      }
    }

    return HTML::serialize($dom);
  }

}
