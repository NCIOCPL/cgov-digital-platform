<?php

/**
 * @file
 * {@inheritdoc}
 */

use Drupal\cgov_blog\Services\BlogManagerInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
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
      case 'blog-series-og-title':
        if (!empty($data['node'])) {
          $replacements[$original] = _get_blog_series_title($data['node'], $name);

          // Tell Drupal to vary the cache of this token
          // based on these query arguments.
          $bubbleable_metadata->addCacheContexts(['url.query_args:topic', 'url.query_args:year']);
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
      if (is_object($seriesEntity)) {
        $seriesEntity = $entityRepository->getTranslationFromContext($seriesEntity, $lang);
        if (!($seriesEntity instanceof Node)) {
          throw new \Exception("The blog series is not of type Node");
        }
        $tid = $seriesEntity->field_site_section->target_id;
        $path = Term::load($tid)->get('computed_path')->value;
        $purl = $seriesEntity->field_pretty_url->value;
        if (!empty($purl)) {
          $path .= ('/' . $purl);
        }
        // Append year.
        $path .= ('/' . $year);
      }
      else {
        \Drupal::logger('cgov_blog')->notice("Blog Post (" . $node->id() . ") has no blog series");
      }
    }
    catch (Exception $e) {
      \Drupal::logger('cgov_blog')
        ->notice('Could not retrieve blog computed path: ' . $path);
    }
  }
  return $path;
}

/**
 * Get the blog series title base of the url params.
 */
function _get_blog_series_title(NodeInterface $node, string $name): string {
  $request = \Drupal::request();
  $topic = $request->query->get('topic');
  $hasTopic = ($topic !== NULL && trim((string) $topic) !== '');
  $year = $request->query->get('year');

  // Normalize an empty string to NULL.
  if ($year === '') {
    $year = NULL;
  }

  // Guard against non-scalars (e.g., arrays) and validate the 4-digit format.
  if ($year !== NULL) {
    if (!is_scalar($year) || !preg_match('/^\d{4}$/', (string) $year)) {
      throw new BadRequestHttpException('year is invalid');
    }
  }

  /** @var \Drupal\cgov_blog\Services\BlogManagerInterface $blogManager */
  $blogManager = \Drupal::service('cgov_blog.blog_manager');

  $titleMode = BlogManagerInterface::TITLE_BROWSER;

  if ($name === 'blog-series-og-title') {
    $titleMode = ($year || $hasTopic)
      ? BlogManagerInterface::TITLE_CARD
      : BlogManagerInterface::TITLE_NODE;
  }

  return $blogManager->getBlogSeriesTitle($year, $hasTopic, $node, $titleMode);
}
