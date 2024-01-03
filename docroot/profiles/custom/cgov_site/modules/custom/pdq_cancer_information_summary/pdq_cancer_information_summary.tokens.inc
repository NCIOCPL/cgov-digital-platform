<?php

/**
 * @file
 * Cgov pdq tokens.
 */

/**
 * Implements hook_token_info().
 */
function pdq_cancer_information_summary_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] =
        [
          'name' => t('Cancer.gov Tokens'),
          'description' => t('Cancer.gov Tokens'),
        ];
  $info['tokens']['cgov_tokens']['cgdp-field-pdq-is-svpc'] =
        [
          'name' => t('CGDP Template SVPC Summary'),
          'description' => t('The value to use for meta tag.'),
        ];
  return $info;
}

/**
 * Implements hook_tokens().
 */
function pdq_cancer_information_summary_tokens($type, $tokens, array $data, array $options, $bubbleable_metadata) {
  $replacements = [];
  if ($type == 'cgov_tokens') {
    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'cgdp-field-pdq-is-svpc':
          $replacements[$original] = get_svpc_summary($data);
          break;
      }
    }
  }
  return $replacements;
}

/**
 * Retrieves the desired metatag value.
 */
function get_svpc_summary(array $data) {

  $svpc_value = "";
  // Get the entity from the appropriate data key.
  if (!empty($data['node'])) {
    $entity = $data['node'];
  }
  if (!empty($entity) && $entity->hasField('field_pdq_is_svpc') && $entity->hasField('field_pdq_summary_type')) {
    $summary_type = $entity->field_pdq_summary_type->value;
    $svpc_value = !empty($entity->field_pdq_is_svpc->value) ? $summary_type . ': svpc' : $summary_type . ': default';
  }
  return $svpc_value;
}
