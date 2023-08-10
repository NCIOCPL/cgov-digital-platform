<?php

/**
 * @file
 * {@inheritdoc}
 */

use Drupal\Core\Render\BubbleableMetadata;
use Drupal\node\Entity\Node;
use Drupal\taxonomy\Entity\Term;
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
 * @param \Drupal\node\Entity\Node $node
 *   The blog series.
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
      $blog_series = Node::load($seriesEntity->id());
      // Get the computed path of the series and pretty URL if not empty.
      $tid = $blog_series->field_site_section->target_id;
      $path = Term::load($tid)->get('computed_path')->value;
      $purl = $blog_series->field_pretty_url->value;
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
 * Get the blog series title base of the url params..
 */
function _get_blog_series_title($node) {
  $hasTopic = \Drupal::request()->query->get('topic') != NULL;
  $year = \Drupal::request()->query->get('year');
  $month = \Drupal::request()->query->get('month');

  // The only allowed characters in dates are numbers. Once we eliminate
  // everything else, there's no need to do further checks.
  if ($year != NULL && (!is_numeric($year) || $year < 0)) {
    throw new BadRequestHttpException('year is invalid');
  }
  if ($month != NULL && (!is_numeric($month) || $month < 1 || $month > 12)) {
    throw new BadRequestHttpException('month is invalid');
  }

  $blogManager = \Drupal::service('cgov_blog.blog_manager');
  return $blogManager->getBlogSeriesTitle($month, $year, $hasTopic, $node);
}
