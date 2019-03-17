<?php

namespace Drupal\cgov_blog\Services;

/**
 * Blog Manager Service.
 */
class BlogManager implements BlogManagerInterface {

  /**
   * {@inheritdoc}
   */
  public function getCurrentEntity() {
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getSeriesEntity($nid) {
    return FALSE;
  }

}
