<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Preprocessing-only transformer for lists.
 */
class NcidsTempTableTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'complex-table' => 'complex-table',
  ];

}
