<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Abstract base class for HTML transformers with shared functionality.
 */
abstract class NcidsHtmlTransformerBase implements NcidsHtmlTransformerInterface {

  /**
   * List of classes that should be skipped via our preprocess function.
   *
   * @var array
   */
  protected static $preprocessClasses = [];

  /**
   * Check if an element should be skipped due to data-html-transformer tag.
   *
   * @param \DOMElement $element
   *   The DOM element to check.
   *
   * @return bool
   *   TRUE if the element should be skipped, FALSE otherwise.
   */
  protected function shouldSkipElement(\DOMElement $element): bool {
    while ($element !== NULL) {
      if ($element instanceof \DOMElement && $element->hasAttribute('data-html-transformer')) {
        return TRUE;
      }
      $element = $element->parentNode;
      if ($element && $element->nodeType !== XML_ELEMENT_NODE) {
        break;
      }
    }
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function preProcessHtml(string $html): string {
    if (empty(static::$preprocessClasses) || empty(trim($html))) {
      return $html;
    }

    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    $class_list = static::$preprocessClasses;

    foreach ($class_list as $class_name) {
      $elements = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' {$class_name} ')]");

      foreach ($elements as $element) {
        /** @var \DomElement $element */
        $element->setAttribute('data-html-transformer', $class_name);
      }
    }

    return Html::serialize($dom);
  }

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    return $html;
  }

}
