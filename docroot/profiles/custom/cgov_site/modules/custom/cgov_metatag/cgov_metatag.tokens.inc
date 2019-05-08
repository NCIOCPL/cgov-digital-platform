<?php

/**
 * @file
 * Cgov metatag tokens.
 */

/**
 * Implements hook_token_info().
 */
function cgov_metatag_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] = ['name' => t('Cancer.gov Tokens'), 'description' => t('Cancer.gov Tokens')];

  $info['tokens']['cgov_tokens'] = [
    'cgov-title' => [
      'name' => t('Cgov Title Meta Tag'),
      'description' => t('The value to user for the title meta tag.'),
    ],
    'cgov-analytics-channel' => [
      'name' => t('Cgov WA Channel'),
      'description' => t('The channel field value.'),
    ],
    'cgov-analytics-group' => [
      'name' => t('Cgov WA Group'),
      'description' => t('The content group field value.'),
    ],
  ];

  return $info;
}

/**
 * Implements hook_tokens().
 */
function cgov_metatag_tokens($type, $tokens, array $data, array $options, $bubbleable_metadata) {
  $replacements = [];
  if ($type == 'cgov_tokens') {
    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'cgov-title':
          $replacements[$original] = get_meta_title_token($data);
          break;

        case 'cgov-analytics-channel':
          $replacements[$original] = 'my WA channel';
          break;

        case 'cgov-analytics-group':
          $replacements[$original] = 'my WA content group';
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

  if (!empty($data['node'])) {
    $entity = $data['node'];
  }
  elseif (!empty($data['media'])) {
    $entity = $data['media'];
  }

  $titleToken = "";
  if (!empty($entity)) {
    /* @var \Drupal\node\NodeInterface $node */

    if ($entity->hasField('field_browser_title') && !$entity->get('field_browser_title')->isEmpty()) {
      $titleToken = $entity->get('field_browser_title')->getValue()[0]['value'];
    }
    elseif ($entity->hasField('field_short_title') && !$entity->get('field_short_title')->isEmpty()) {
      $titleToken = $entity->get('field_short_title')->getValue()[0]['value'];
    }
  }
  return $titleToken;
}
