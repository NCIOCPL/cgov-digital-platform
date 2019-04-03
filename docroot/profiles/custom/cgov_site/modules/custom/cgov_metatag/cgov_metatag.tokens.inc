<?php

/**
 * @file
 * Cgov metatag tokens.
 */

use Drupal\Core\Render\BubbleableMetadata;

/**
 * Implements hook_token_info().
 */
function cgov_metatag_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] = ['name' => t('Cancer.gov Tokens'), 'description' => t('Cancer.gov Tokens')];

  $info['tokens']['cgov_tokens']['cgov:title'] =
    [
      'name' => t('Cgov Title Meta Tag'),
      'description' => t('The value to user for the title meta tag.'),
    ];

  return $info;
}

/**
 * Implements hook_tokens().
 */
function cgov_metatag_tokens($type, $tokens, array $data, array $options, BubbleableMetadata $bubbleable_metadata) {
  $replacements = [];
  if ($type == 'cgov_tokens') {
    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'cgov-title':
          $replacements[$original] = get_meta_title_token($data);
          break;
      }
    }
  }
  return $replacements;
}

/**
 * Retrieves the desired metatag title.
 */
function get_meta_title_token(array $data) {
  $titleToken = "";
  if (!empty($data['node'])) {
    /* @var \Drupal\node\NodeInterface $node */
    $node = $data['node'];
    if ($node->hasField('field_browser_title')) {
      $titleToken = $node->get('field_browser_title')->getValue()[0]['value'];
    }
    elseif ($node->hasField('field_short_title')) {
      $titleToken = $node->get('field_short_title')->getValue()[0]['value'];
    }
  }
  return $titleToken;
}
