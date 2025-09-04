<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Abstract base class for HTML transformers with shared functionality.
 */
abstract class NcidsHtmlTransformerBase implements NcidsHtmlTransformerInterface {

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

}
