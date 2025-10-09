<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Transformer Interface for embedded WYSIWYG content.
 */
interface NcidsHtmlTransformerInterface {

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

  /**
   * Pre-process HTML before transformation.
   *
   * @param string $html
   *   The HTML to pre-process.
   *
   * @return string
   *   The pre-processed HTML.
   */
  public function preProcessHtml(string $html): string;

}
