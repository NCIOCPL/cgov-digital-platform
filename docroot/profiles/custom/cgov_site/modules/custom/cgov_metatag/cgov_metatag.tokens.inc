<?php

/**
 * @file
 * Cgov metatag tokens.
 */

use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;

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
          $replacements[$original] = get_taxonomy_field_token($data, 'field_channel');
          break;

        case 'cgov-analytics-group':
          $replacements[$original] = get_taxonomy_field_token($data, 'field_content_group');
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
  }
  return $titleToken;
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
function get_taxonomy_field_token(array $data, $fieldname) {
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
      $parent['node'] = get_valid_parent($alias);

      // Recurse through this method until a field value is found.
      $fieldToken = get_taxonomy_field_token($parent, $fieldname);
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
function get_valid_parent($alias) {
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
    $node = get_valid_parent($parentAlias);
    return $node;
  }

}
