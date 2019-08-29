<?php

namespace Drupal\cgov_vocab_manager\Routing;

use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\Route;

/**
 * Listens to the dynamic route events.
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * {@inheritdoc}
   */
  protected function alterRoutes(RouteCollection $collection) {
    if ($overview_page_route = $this->getOverviewOneLevelPageRoute()) {
      $collection->add("cgov_vocab_manager.overview_onelevel_form", $overview_page_route);
    }
  }

  /**
   * Gets the overview page route.
   *
   * @return \Symfony\Component\Routing\Route|null
   *   The generated route, if available.
   */
  protected function getOverviewOneLevelPageRoute() {
    $route = new Route('/admin/structure/cgov_taxonomy_manager/{taxonomy_vocabulary}/{parent_tid}');
    $route->setDefault('_title_callback', 'Drupal\taxonomy\Controller\TaxonomyController::vocabularyTitle');
    $route->setDefault('_form', 'Drupal\cgov_vocab_manager\Form\CgovVocabManagerForm');
    $route->setRequirement('_entity_access', 'taxonomy_vocabulary.access taxonomy overview');
    $route->setOption('_admin_route', TRUE);

    return $route;
  }

}
