<?php

namespace Drupal\cgov_core\Services;

/**
 * Transformer Interface for embedded WYSIWYG content.
 */
interface HtmlTransformerInterface {

  /**
   * Applies an HTML transformation to a string of HTML.
   *
   * @param string $html
   *   The original HTML.
   *
   * @return string
   *   The transformed HTML.
   */
  public function transform(string $html): string;

}
