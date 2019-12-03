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
        case '[cgov_tokens:cgov-title]':
          $replacements[$key] = 'Find NCI-Supported Clinical Trials - Advanced Search';
          break;

        case '[node:field_page_description:value]':
          $replacements[$key] = 'Use our advanced search to find an NCI-supported clinical trial—and learn how to locate other research studies—that may be right for you or a loved one.';
          break;

        case '[node:field_browser_title:value]':
          $replacements[$key] = 'Find NCI-Supported Clinical Trials - Advanced Search';
          break;

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
      '[cgov_tokens:cgov-title]',
      '[node:field_page_description:value]',
      '[node:field_browser_title:value]',
      '[node:url]',
      '[current-page:url]',
    ];

    return $tokensToAlter;
  }

}
