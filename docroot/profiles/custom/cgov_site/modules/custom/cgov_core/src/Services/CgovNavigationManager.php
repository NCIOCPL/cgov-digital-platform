<?php

namespace Drupal\cgov_core\Services;

use Drupal\Core\Routing\RouteMatchInterface;

/**
 * Class CgovNavigationManager.
 */
class CgovNavigationManager implements CgovNavigationManagerInterface {

  /**
   * Current route match service.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatch;

  /**
   * Constructs a new CgovNavigationManager class.
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The route match.
   */
  public function __construct(RouteMatchInterface $route_match) {
    $this->routeMatch = $route_match;
    // kint(\Drupal::service('path.current')->getPath());
    // kint(\Drupal\Core\Url::fromRoute('<current>')->toString());
    // kint(\Drupal\Core\Url::fromRoute('<current>')->getInternalPath());
    // kint(\Drupal::routeMatch()->getParameters());
    // var_dump($route_match->getParameters());
    // Can do route testing here, but I have a question about
    // caching annd whether we want to runn that test multiple
    // times.
    // 1. Get currenty entity (store)
    // 2. Guard clause against unwanted entity types?
    // 3. Get Site Section Entity from entity field_site_section (store)
  }

  /**
   * Undocumented function.
   */
  public function getClosestSiteSection() {
    $entityManager = NULL;
    // /foo/bar/baz.
    $currentPath = $this->routeMatch->getPath();
    // [ 'foo', 'bar', 'baz' ] (might need root '/').
    $pathSteps = explode('/', $currentPath);
    for ($i = 0; $i < count($pathSteps); $i++) {
      $testPathForSiteSectionEntity = array_slice($pathSteps, 0, (count($pathSteps - $i)));
      $siteSection = $entityManager->getSiteSectionForTestPath($testPathForSiteSectionEntity);
      if ($siteSection instanceof Term) {
        return $siteSection;
      }
    }
  }

  /**
   * Undocumented function.
   *
   * @param string $test
   *   Regex.
   */
  public function getNavRoot($test) {
    // TermEntityList
    // $walkBase = $this->getClosestSiteSection();
    // $parentage = $walkBase->getParents();
    // Walk forward through parentage until $test is met,
    // return slice of array starting there until $walkBase.
  }

  /**
   * Undocumented function.
   */
  public function getAncestry() {
    // $currentSiteSection = $this->getClosestSiteSection();
  }

  /**
   * Undocumented function.
   *
   * @param string $terminusTest
   *   Should be a regex.
   * @param array $exceptionsTest
   *   Array.
   */
  public function getSections(string $terminusTest, array $exceptionsTest) {

  }

}
