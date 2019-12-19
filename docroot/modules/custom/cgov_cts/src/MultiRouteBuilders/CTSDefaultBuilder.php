<?php

namespace Drupal\cgov_cts\MultiRouteBuilders;

/**
 * Default route builder for CTS.
 *
 * Loads the React app.
 */
class CTSDefaultBuilder extends CTSBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'default';
  }

}
