<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

/**
 * Transformer for embedded entities.
 */
class NcidsEmbeddedEntitiesTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessElements = [
    'drupal-entity',
  ];

}
