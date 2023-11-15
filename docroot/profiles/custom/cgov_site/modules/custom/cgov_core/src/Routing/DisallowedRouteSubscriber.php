<?php

namespace Drupal\cgov_core\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Drupal\Core\Site\Settings;
use Symfony\Component\Routing\RouteCollection;

/**
 * Listens to the dynamic route events.
 */
class DisallowedRouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    // Always deny access to unwanted routes.
    $disallow_routes = Settings::get('disallow_routes', []);
    // Loop through all of the disallowed routes.
    foreach ($disallow_routes as $disallow_route) {
      if ($route = $collection->get($disallow_route)) {
        $route->setRequirement('_access', 'FALSE');
      }
    }
  }

}
