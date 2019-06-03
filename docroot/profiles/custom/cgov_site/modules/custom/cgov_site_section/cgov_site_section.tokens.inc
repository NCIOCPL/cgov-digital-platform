<?php

/**
 * @file
 * {@inheritdoc}
 */

use Drupal\Core\Render\BubbleableMetadata;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;

/**
 * Implements hook_token_info().
 */
function cgov_site_section_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] = ['name' => t('Cancer.gov Tokens'), 'description' => t('Cancer.gov Tokens')];
  $info['tokens']['cgov_tokens'] = [
    'cgov-computed-path' => [
      'name' => t('Computed Path'),
      'description' => t('The computed path of the term..'),
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

      // Replace 'node/[nid]' with Site Section & Pretty URL.
      case 'cgov-computed-path':
        if (!empty($data['node'])) {
          $entity = $data['node'];
        }
        elseif (!empty($data['media'])) {
          $entity = $data['media'];
        }

        if (!empty($entity->get('field_site_section')->first())) {
          try {
            $tid = $entity->get('field_site_section')->first()->getValue()['target_id'];
            $term = Term::load($tid);;
            $replacements[$original] = $term->get('computed_path')->value;
          }
          catch (Exception $e) {
            \Drupal::logger('cgov_site_section')
              ->notice('Could not retrieve computed path for tid: ' . $tid);
          }
        }
        break;

      // Set the token to the field_channel value.
      case 'cgov-analytics-channel':
        $replacements[$original] = _get_taxonomy_field_token($data, 'field_channel');
        break;

      // Set the token to the field_content_group value.
      case 'cgov-analytics-group':
        $replacements[$original] = _get_taxonomy_field_token($data, 'field_content_group');
        break;

    }
  }
  return $replacements;
}

/**
 * Get a given field value from taxonomy term.
 *
 * @param array $data
 *   An associative array of data objects.
 * @param string $fieldname
 *   The name of the field.
 *
 * @return string
 *   String value of the selected field.
 */
function _get_taxonomy_field_token(array $data, $fieldname) {
  $rtn = t('NCI');
  $node = $data['node'] ?? NULL;

  if (isset($node) && !empty($node)) {

    /*
     * Get the site section and its ancestors, then loop through
     * until a valid string value is found or we run out of site
     * section taxons.
     */
    if ($node->hasField('field_site_section') && !empty($node->get('field_site_section')->first())) {
      $tid = $node->get('field_site_section')->first()->getValue()['target_id'];
      $sections = \Drupal::service('entity_type.manager')->getStorage("taxonomy_term")->loadAllParents($tid);
      foreach ($sections as $section) {
        $sid = $section->id();
        $fieldToken = Term::load($sid)->get($fieldname)->value;
        if (isset($fieldToken) && trim($fieldToken) !== '') {
          return $fieldToken;
        }
      }
    }

    /*
     * If there is no site section, traverse through ancestor
     * paths until one is found.
     */
    else {
      $nid = $node->id();
      $alias = \Drupal::service('path.alias_manager')->getAliasByPath('/node/' . $nid);
      $parent['node'] = _get_valid_parent($alias);

      // Recurse through this method until a field value is found.
      $fieldToken = _get_taxonomy_field_token($parent, $fieldname);
      return $fieldToken;
    }
  }

  /*
   * If we hit this, it means the taxonomy field is not set
   * anywhere between here and the tree root.
   */
  return $rtn;
}

/**
 * Search for ancestor nodes by alias.
 *
 * @param string $alias
 *   An associative array of data objects.
 *
 * @return \Drupal\node\Entity\Node
 *   Node object.
 */
function _get_valid_parent($alias) {
  if (!isset($alias) || trim($alias) === '') {
    return NULL;
  }

  // Trim the last section of the current alias and get the 'node/<nid>' path.
  $parentAlias = preg_replace('#\/[^/]*$#', '', $alias);
  $parentPath = \Drupal::service('path.alias_manager')->getPathByAlias($parentAlias);

  // Return node if matches, otherwise run through this method again.
  if (preg_match('/node\/(\d+)/', $parentPath, $matches)) {
    $node = Node::load($matches[1]);
    return $node;
  }
  else {
    $node = _get_valid_parent($parentAlias);
    return $node;
  }

}
