<?php

namespace Drupal\cgov_blog\Services;

/**
 * Methods for retrieving a related Blog Series.
 */
interface BlogManagerInterface {

  /**
   * Determine whether the entity is a Blog Series.
   */
  public function isSeries();

  /**
   * Get the Blog Series entity.
   */
  public function getSeries();

}
