<?php

namespace Drupal\cgov_blog\Services;

/**
 * Blog Manager Service.
 */
class BlogManager implements BlogManagerInterface {

  /**
   * Determine whether the entity is a Blog Series.
   */
  public function isSeries() {
    return FALSE;
  }

  /**
   * Get the Blog Series entity.
   */
  public function getSeries() {
    return "Cancer Currents Blog";
  }

}
