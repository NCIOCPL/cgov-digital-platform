<?php

namespace Drupal\cgov_blog\Services;

/**
 * Methods for retrieving a related Blog Series.
 */
interface BlogManager2Interface {

  /**
   * Gets the blog series from the route.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  public function getSeriesFromRoute();

  /**
   * Gets the topics by blog series.
   *
   * @param Drupal\Core\Entity\ContentEntityInterface $blog_series
   *   The blog series.
   *
   * @return Drupal\taxonomy\TermInterface[]
   *   The blog topics.
   */
  public function getTopicsBySeries(ContentEntityInterface $blog_series);

  /**
   * Gets the topics by blog series Id.
   *
   * @param string $id
   *   The blog series Id.
   *
   * @return Drupal\taxnomony\TermInterface[]
   *   The blog topics.
   */
  public function getTopicsBySeriesId($id);

  /**
   * Gets all the blog topics.
   *
   * @param string $id
   *   The blog series id.
   *
   * @return Drupal\taxonomy\TermInterface[]
   *   All of the blog topics.
   */
  public function getAllTopics($id);

}
