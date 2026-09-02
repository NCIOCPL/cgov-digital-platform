<?php

namespace Drupal\cgov_core;

use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\Context\CacheContextInterface;
use Drupal\Core\Cache\Context\RequestStackCacheContextBase;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Defines a service for primary navigation active state caching.
 *
 * We do not want to draw the primary nav for every page on a site,
 * however we need to handle the active state highlighting for each menu item.
 * So this will allow us to only have to render a version of the navigation
 * for each menu item activated + none activated.
 *
 * This code WILL be executed on each request, so it needs to be lean.
 *
 * Cache context ID: 'nci_primary_nav_active_path'
 */
class NciPrimaryNavCacheContext extends RequestStackCacheContextBase implements CacheContextInterface {

  /**
   * The CGOV navigation manager.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navigationManager;

  /**
   * Constructs a new NciPrimaryNavCacheContext class.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   * @param \Drupal\cgov_core\Services\CgovNavigationManager $navigation_manager
   *   The CGOV navigation manager.
   */
  public function __construct(RequestStack $request_stack, CgovNavigationManager $navigation_manager) {
    parent::__construct($request_stack);
    $this->navigationManager = $navigation_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function getLabel() {
    return t('NCI Primary Nav Active State');
  }

  /**
   * {@inheritdoc}
   */
  public function getContext() {
    return $this->navigationManager->getPrimaryNavActivePath();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata() {
    // I don't think there is really anything related to the cache tags or
    // anything here. So, just return a cachable metadata.
    return new CacheableMetadata();
  }

}
