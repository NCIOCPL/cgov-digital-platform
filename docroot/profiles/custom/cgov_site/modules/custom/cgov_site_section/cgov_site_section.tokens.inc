<?php

/**
 * @file
 * {@inheritdoc}
 */

use Drupal\Core\Render\BubbleableMetadata;

/**
 * Implements hook_token_info().
 */
function cgov_site_section_token_info() {
  $info = [];

  $info['tokens']['array']['tail'] = [
    'name' => t('Tail'),
    'description' => t('Slice the array.'),
    'type' => 'array',
  ];

  $info['tokens']['array']['nci-join-path'] = [
    'name' => t('Joined path'),
    'description' => t('Join by URL Name.'),
  ];

  return $info;
}

/**
 * Implements hook_tokens().
 */
function cgov_site_section_tokens($type, $tokens, array $data, array $options, BubbleableMetadata $bubbleable_metadata) {

  $replacements = [];

  if ($type == 'array' && !empty($data['array']) && is_array($data['array'])) {

    $array = $data['array'];

    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'nci-join-path':

          $values = [];
          foreach (token_element_children($array) as $key) {
            $term = \Drupal::entityTypeManager()->getStorage('taxonomy_term')->load($key);
            $value = $term->get('field_pretty_url')->value;
            $values[] = $value;
          }
          $replacements[$original] = implode('/', $values);

          break;

        case 'tail':
          $tail = array_shift($array, TRUE);
          $replacements[$original] = token_render_array($tail, $options);

          break;
      }
    }
  }
  return $replacements;
}
