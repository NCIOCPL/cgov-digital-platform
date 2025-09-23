<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Preprocessing-only transformer for tables.
 */
class NcidsTempTableTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'complex-table',
  ];

  /**
   * {@inheritdoc}
   */
  protected static $preprocessElements = [
    'table',
  ];

}
