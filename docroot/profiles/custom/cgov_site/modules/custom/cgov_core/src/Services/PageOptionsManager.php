<?php

namespace Drupal\cgov_core\Services;

use Drupal\Core\Routing\RouteMatchInterface;

/**
 * Page Options Manager Service.
 */
class PageOptionsManager {

  /**
   * The route match.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  protected $nodeType = '';

  /**
   * Constructs a new Page Options Manager Service class.
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The route match.
   */
  public function __construct(RouteMatchInterface $route_match) {
    $this->routeMatch = $route_match;
    $this->nodeType = 'Test';
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig() {
    return $this->nodeType;
  }

}
