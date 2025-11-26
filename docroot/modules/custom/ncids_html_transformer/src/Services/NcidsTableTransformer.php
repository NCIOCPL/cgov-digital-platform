<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Transformer for tables.
 */
class NcidsTableTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessElements = [
    'table',
  ];

}
