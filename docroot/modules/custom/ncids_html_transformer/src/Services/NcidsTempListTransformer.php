<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Preprocessing-only transformer for lists.
 */
class NcidsTempListTransformer extends NcidsHtmlTransformerBase {
  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'no-bullets',
    'no-description',
  ];

}
