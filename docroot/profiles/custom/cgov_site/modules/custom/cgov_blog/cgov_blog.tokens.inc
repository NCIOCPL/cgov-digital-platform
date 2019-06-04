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
function cgov_blog_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] = ['name' => t('Cancer.gov Tokens'), 'description' => t('Cancer.gov Tokens')];
  $info['tokens']['cgov_tokens'] = [
    'blog-post-path' => [
      'name' => t('Blog Post Path'),
      'description' => t('The computed path of a Blog Post.'),
    ],
    'blog-topic-path' => [
      'name' => t('Blog Topic Path'),
      'description' => t('The path of a Blog Topic taxonomy term.'),
    ],
  ];

  return $info;
}

/**
 * Implements hook_tokens().
 *
 * Generates a custom token which fetches a terms computed_path.
 */
function cgov_blog_tokens($type, $tokens, array $data, array $options, BubbleableMetadata $bubbleable_metadata) {
  $replacements = [];

  // Loop through tokens and set replacement values.
  foreach ($tokens as $name => $original) {
    switch ($name) {

      // Replace 'node/[nid]' with parent Site Section, year, and Pretty URL.
      case 'blog-post-path':
        if (!empty($data['node'])) {
          $replacements[$original] = _get_blog_post_path($data['node'] ?: $replacements[$original]);
        }
        break;

      // Replace 'taxonomy/term/[tid]' with owner Site Section and Pretty URL.
      case 'blog-topic-path':
        if (!empty($data['term'])) {
          $replacements[$original] = _get_blog_topic_path($data['term'] ?: $replacements[$original]);
        }
        break;
    }
  }

  return $replacements;
}

/**
 * Get the canonical url for a blog.
 *
 * @throws \Drupal\Core\TypedData\Exception\MissingDataException
 *   Error for missing data.
 */
function _get_blog_post_path($node) {
  $entityRepository = \Drupal::service('entity.repository');
  $lang = $node->language()->getId();
  $year = '/' . substr($node->field_date_posted->value, 0, 4);
  $path = FALSE;

  if (!empty($node->get('field_blog_series')->first())) {
    try {
      // Get the owner series and translation if exists.
      $seriesEntity = $node->field_blog_series->entity;
      $seriesEntity = $entityRepository->getTranslationFromContext($seriesEntity, $lang);

      // Get the computed path of the series.
      $tid = $seriesEntity->field_site_section->target_id;
      $path = Term::load($tid)->get('computed_path')->value;
      $path = $path . $year;
    }
    catch (Exception $e) {
      \Drupal::logger('cgov_blog')
        ->notice('Could not retrieve blog computed path: ' . $path);
    }
  }
  return $path;
}

/**
 * Get the path for a blog taxnomy term.
 *
 * @throws \Drupal\Core\TypedData\Exception\MissingDataException
 *   Error for missing data.
 */
function _get_blog_topic_path($term) {
  $path = FALSE;

  if (!empty($term->field_pretty_url->value)) {
    try {
      $nid = $term->get('field_owner_blog')->first()->getValue()['target_id'];
      $name = $term->field_pretty_url->value;
      $alias = \Drupal::service('path.alias_manager')->getAliasByPath('/node/' . $nid);
      $path = $alias . '/' . $name;
    }
    catch (Exception $e) {
      \Drupal::logger('cgov_blog')
        ->notice('Could not retrieve computed path for Blog Topic nid: ' . $nid);
    }
  }
  return $path;
}
