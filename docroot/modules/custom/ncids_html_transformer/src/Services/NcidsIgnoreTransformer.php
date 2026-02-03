<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Transformer for elements that we should ignore.
 *
 * This is an initial try and making the transformer system idempotent by
 * explicitly ignoring certain elements or classes that have already been
 * transformed previously, e.g., media wrapper classes added by the
 * pullquote or callout box transformers. These would also be structures
 * that would not survive the Disallowed* transformers.
 *
 * Something like <nci-definition> or <drupal-entity> are already supported
 * by the Disallowed* transformers, so they do not need to be included here.
 */
class NcidsIgnoreTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    // The media wrapper class appears as the result of pull quote and callout
    // transformations.
    'cgdp-embed-media-wrapper',
  ];

}
