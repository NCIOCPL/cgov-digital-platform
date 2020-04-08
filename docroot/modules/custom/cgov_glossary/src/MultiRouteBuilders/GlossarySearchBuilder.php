<?php

namespace Drupal\cgov_glossary\MultiRouteBuilders;

/**
 * Search route builder for glossary.
 *
 * Loads the React app.
 */
class GlossarySearchBuilder extends GlossaryBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'search';
  }

}
