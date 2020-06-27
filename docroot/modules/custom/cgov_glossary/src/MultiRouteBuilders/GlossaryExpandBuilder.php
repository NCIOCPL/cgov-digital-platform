<?php

namespace Drupal\cgov_glossary\MultiRouteBuilders;

/**
 * Expand route builder for glossary.
 *
 * Loads the React app.
 */
class GlossaryExpandBuilder extends GlossaryBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'expand';
  }

}
