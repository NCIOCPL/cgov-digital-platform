<?php

namespace Drupal\ncids_html_transformer\Services;

/**
 * Transformer for lists.
 */
class NcidsListTransformer extends NcidsHtmlTransformerBase {
  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'no-bullets',
    'no-description',
  ];

}
