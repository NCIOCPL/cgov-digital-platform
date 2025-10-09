<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

/**
 * Preprocessing-only transformer for callout boxes.
 */
class NcidsTempCalloutBoxTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'callout-box',
    'callout-box-left',
    'callout-box-right',
    'callout-box-center',
  ];

}
