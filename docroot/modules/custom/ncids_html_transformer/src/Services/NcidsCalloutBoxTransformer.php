<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

/**
 * Transformer for callout boxes.
 */
class NcidsCalloutBoxTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'callout-box',
    'callout-box-left',
    'callout-box-right',
    'callout-box-center',
    'callout-box-full',
  ];

}
