<?php

namespace Drupal\cgov_blog\Services;

/**
 * Methods for retrieving a related Blog Series.
 */
interface BlogManagerInterface {

  /**
   * Get the current entity type.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  public function getCurrentEntity();

  /**
   * Get the associated Blog Series entity.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  public function getSeriesEntity();

  /**
   * Get the in-usage blog categories.
   *
   * @return array
   *   The active topics, or an empty array if none found.
   */
  public function getActiveSeriesTopics();

}
