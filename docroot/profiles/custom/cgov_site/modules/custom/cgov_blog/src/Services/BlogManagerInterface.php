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
   * @param string $nid
   *   A node ID representing a single content item.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  public function getSeriesEntity($nid);

}
