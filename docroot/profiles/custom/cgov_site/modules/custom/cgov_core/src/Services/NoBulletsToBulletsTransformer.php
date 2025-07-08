<?php

namespace Drupal\cgov_core\Services;

use Drupal\Component\Utility\Html;

/**
 * Page Options Manager Service.
 */
class NoBulletsToBulletsTransformer implements HtmlTransformerInterface {

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);
    $nodes = $xpath->query('//*[@class and contains(concat(" ", normalize-space(@class), " "), " no-bullets ")]');

    foreach ($nodes as $node) {
      /** @var \DOMElement $node */
      $class_attr = $node->getAttribute('class');
      $new_class_attr = preg_replace('/\bno-bullets\b/', 'bullets', $class_attr);
      $node->setAttribute('class', $new_class_attr);
    }
    $body = $dom->getElementsByTagName('body')->item(0);
    $output = '';
    foreach ($body->childNodes as $child) {
      $output .= $dom->saveHTML($child);
    }

    return $output;
  }

}
