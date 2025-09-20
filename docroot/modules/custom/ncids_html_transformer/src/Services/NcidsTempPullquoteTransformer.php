<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Preprocessing-only transformer for lists.
 */
class NcidsTempPullquoteTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'pullquote' => 'pullquote',
  ];

}
