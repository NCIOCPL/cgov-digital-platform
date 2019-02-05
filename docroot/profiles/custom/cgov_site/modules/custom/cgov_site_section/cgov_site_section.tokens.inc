<?php

/**
 * @file
 * {@inheritdoc}
 */

use Drupal\Core\Render\BubbleableMetadata;
use Drupal\taxonomy\Entity\Term;

/**
 * Implements hook_token_info().
 */
function cgov_site_section_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] = ['name' => t('Cancer.gov Tokens'), 'description' => t('Cancer.gov Tokens')];

  $info['tokens']['cgov_tokens']['cgov-computed-path'] = [
    'name' => t('Computed Path'),
    'description' => t('The computed path of the term..'),
  ];

  return $info;
}

/**
 * Implements hook_tokens().
 *
 * Generates a custom token which fetches a terms computed_path.
 *
 * @throws \Drupal\Core\TypedData\Exception\MissingDataException
 *   Error for missing data.
 */
function cgov_site_section_tokens($type, $tokens, array $data, array $options, BubbleableMetadata $bubbleable_metadata) {
  $replacements = [];
  foreach ($tokens as $name => $original) {
    switch ($name) {
      case 'cgov-computed-path':

        if (!empty($data['node'])) {
          /* @var \Drupal\node\NodeInterface $node */
          $node = $data['node'];
          if (!empty($node->get('field_site_section')->first())) {
            try {
              $tid = $node->get('field_site_section')->first()->getValue()['target_id'];
              $term = Term::load($tid);;
              $replacements[$original] = $term->get('computed_path')->value;
            }
            catch (Exception $e) {
              \Drupal::logger('cgov_site_section')
                ->notice('Could not retrieve computed path for tid: ' . $tid);
            }
          }
          break;
        }
    }
  }
  return $replacements;
}
