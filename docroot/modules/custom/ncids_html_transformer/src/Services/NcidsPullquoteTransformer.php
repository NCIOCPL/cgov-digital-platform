<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Transformer for pullquotes.
 */
class NcidsPullquoteTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'pullquote',
  ];

}
