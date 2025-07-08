<?php

namespace Drupal\cgov_core\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer to remove mso-bidi-theme-font:minor-latin from style attributes.
 */
class RemoveMsoBidiThemeFontTransformer implements HtmlTransformerInterface {

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);
    $nodes = $xpath->query('//*[@style and contains(@style, "mso-bidi-theme-font:minor-latin")]');

    foreach ($nodes as $node) {
      /** @var \DOMElement $node */
      $style_attr = $node->getAttribute('style');

      /* Remove mso-bidi-theme-font:minor-latin from style */
      $new_style_attr = preg_replace('/\bmso-bidi-theme-font\s*:\s*minor-latin\s*;?\s*/', '', $style_attr);

      /* Clean up extra spaces and semicolons */
      $new_style_attr = preg_replace('/\s+/', ' ', trim($new_style_attr));
      $new_style_attr = preg_replace('/;+/', ';', $new_style_attr);
      $new_style_attr = preg_replace('/^;+|;+$/', '', $new_style_attr);

      /* If the style attribute is empty after removal, remove the entire attribute */
      if (empty($new_style_attr)) {
        $node->removeAttribute('style');
      }
      else {
        $node->setAttribute('style', $new_style_attr);
      }
    }

    return Html::serialize($dom);
  }

}
