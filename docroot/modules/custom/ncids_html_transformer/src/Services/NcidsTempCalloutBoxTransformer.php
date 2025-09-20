<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

/**
 * Transforms HTML by removing disallowed styles.
 */
class NcidsTempCalloutBoxTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'callout-box' => 'summary-box',
    'callout-box-left' => 'summary-box',
    'callout-box-right' => 'summary-box',
    'callout-box-center' => 'summary-box',
  ];

}
