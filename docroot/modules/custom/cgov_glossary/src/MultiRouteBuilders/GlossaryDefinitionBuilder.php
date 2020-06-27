<?php

namespace Drupal\cgov_glossary\MultiRouteBuilders;

/**
 * Definition route builder for glossary.
 *
 * Loads the React app.
 */
class GlossaryDefinitionBuilder extends GlossaryBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'definition';
  }

}
