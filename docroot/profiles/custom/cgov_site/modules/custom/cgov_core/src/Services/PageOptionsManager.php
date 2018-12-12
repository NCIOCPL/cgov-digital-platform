<?php

namespace Drupal\cgov_core\Services;

/**
 * Page Options Manager Service.
 */
class PageOptionsManager {

  protected $nodeType = '';

  /**
   * {@inheritdoc}
   */
  public function __construct() {
    $this->nodeType = 'Test';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig() {
    return $this->nodeType;
  }

}
