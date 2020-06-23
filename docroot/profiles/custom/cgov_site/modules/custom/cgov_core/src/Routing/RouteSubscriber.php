<?php

namespace Drupal\cgov_core\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Listens to the dynamic route events.
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    // Allow Site Admins to access the bulk update form for URLs. This
    // is useful when a site section URL is changed and all the nodes
    // and media under that URL need to be rebuilt.
    // Why add a permission? The default permission 'administer url aliases'
    // allows for dangerous activities we want to avoid. (e.g. bulk delete)
    if ($route = $collection->get('pathauto.bulk.update.form')) {
      $new_perm = 'regenerate urls';
      $permission = $route->getRequirement('_permission');
      $route->setRequirement(
        '_permission',
        ($permission ? $permission . '+' . $new_perm : $new_perm)
      );
    }
  }

}
