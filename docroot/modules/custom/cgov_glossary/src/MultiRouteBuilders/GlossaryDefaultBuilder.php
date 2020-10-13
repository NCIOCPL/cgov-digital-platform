<?php

namespace Drupal\cgov_glossary\MultiRouteBuilders;

/**
 * Default route builder for glossary.
 *
 * Loads the React app.
 */
class GlossaryDefaultBuilder extends GlossaryBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'default';
  }

}
