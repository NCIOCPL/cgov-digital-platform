<?php

namespace Drupal\cgov_cts\MultiRouteBuilders;

/**
 * Advanced search route builder for CTS.
 *
 * Loads the React app; sets up the page-specific metadata.
 */
class CTSAdvancedSearchBuilder extends CTSBuilderBase {

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'advanced_search';
  }

  /**
   * {@inheritdoc}
   */
  public function alterTokens(array &$replacements, array $context, array $options = []) {
    foreach ($replacements as $key => $value) {
      switch ($key) {
        case '[node:url]':
          $replacements[$key] = $value . '/advanced';
          break;

        case '[current-page:url]':
          $replacements[$key] = $value . '/advanced';
          break;

        default:
          break;
      }
    }
  }

  /**
   * {@inheritdoc}
   *
   * Return an array of tokens to alter.
   */
  public function getTokensForAltering(array $options = []) {
    $tokensToAlter = [
      '[node:url]',
      '[current-page:url]',
    ];

    return $tokensToAlter;
  }

}
