<?php

/**
 * @file
 * {@inheritdoc}
 */

use Drupal\Core\Render\BubbleableMetadata;
use Drupal\taxonomy\Entity\Term;
use Drupal\Component\Utility\Html;
use Drupal\Component\Utility\Xss;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;

/**
 * Implements hook_token_info().
 */
function cgov_blog_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] = [
    'name' => t('Cancer.gov Tokens'),
    'description' => t('Cancer.gov Tokens'),
  ];
  $info['tokens']['cgov_tokens'] = [
    'blog-post-path' => [
      'name' => t('Blog Post Path'),
      'description' => t('The computed path of a Blog Post.'),
    ],
    'blog-topic-path' => [
      'name' => t('Blog Topic Path'),
      'description' => t('The path of a Blog Topic taxonomy term.'),
    ],
    'blog-series-title' => [
      'name' => t('Blog Series Title'),
      'description' => t('The title for the blog series page based on filters.'),
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
      // @todo Remove this case; dead code.
      case 'blog-topic-path':
        if (!empty($data['term'])) {
          $replacements[$original] = _get_blog_topic_path($data['term'] ?: $replacements[$original]);
        }
        break;

      case 'blog-series-title':
        if (!empty($data['node'])) {
          $replacements[$original] = _get_blog_series_title($data['node']);
        }
        break;

      default;
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
  $year = substr($node->field_date_posted->value, 0, 4);
  $path = FALSE;

  if (!empty($node->get('field_blog_series')->first())) {
    try {
      // Get the owner series and translation if exists.
      $seriesEntity = $node->field_blog_series->entity;
      $seriesEntity = $entityRepository->getTranslationFromContext($seriesEntity, $lang);

      // Get the computed path of the series and pretty URL if not empty.
      $tid = $seriesEntity->field_site_section->target_id;
      $path = Term::load($tid)->get('computed_path')->value;
      $purl = $seriesEntity->field_pretty_url->value;
      if (!empty($purl)) {
        $path .= ('/' . $purl);
      }
      // Append year.
      $path .= ('/' . $year);
    }
    catch (Exception $e) {
      \Drupal::logger('cgov_blog')
        ->notice('Could not retrieve blog computed path: ' . $path);
    }
  }
  return $path;
}

/**
 * Get the path for a blog taxnomy term. TODO: deprecated, remove this function.
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
      $alias = \Drupal::service('path_alias.manager')->getAliasByPath('/node/' . $nid);
      $path = $alias . '/' . $name;
    }
    catch (Exception $e) {
      \Drupal::logger('cgov_blog')
        ->notice('Could not retrieve computed path for Blog Topic nid: ' . $nid);
    }
  }
  return $path;
}

/**
 * Get the blog series title base of the url params..
 */
function _get_blog_series_title($node) {

  // Get year parameter.
  $year = \Drupal::request()->query->get('year');

  // Get topic parameter.
  $topic_param = \Drupal::request()->query->get('topic');
  // Sanitize query string inputs to prevent string injection.
  $topic = Xss::filter($topic_param);
  $topic = Html::escape($topic);

  // Get month parameter.
  $month = \Drupal::request()->query->get('month');

  // Throw an exception if the year is invalid.
  if (isset($year) && (!is_numeric($year) || $year < 0)) {
    throw new BadRequestHttpException('year is invalid');
  }
  // Throw an exception if the month is invalid.
  if (isset($month) && (!is_numeric($month) || $month < 1 || $month > 12)) {
    throw new BadRequestHttpException('month is invalid');
  }

  // Make sure For topic, only alphanumeric characters should be
  // allowed, plus colon ( : ) and hyphen ( - ).
  if (!empty($topic) && !preg_match('/^[a-zA-Z0-9:-]*$/', $topic)) {
    throw new BadRequestHttpException('month is invalid');
  }

  $blogManager = \Drupal::service('cgov_blog.blog_manager');
  return $blogManager->getBlogSeriesTitle($month, $year, $topic, $node);

}
