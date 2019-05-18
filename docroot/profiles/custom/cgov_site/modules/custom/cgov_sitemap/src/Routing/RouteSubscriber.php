<?php

namespace Drupal\cgov_sitemap\Routing;

use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Routing\RouteSubscriberBase;
use Symfony\Component\Routing\RouteCollection;

/**
 * Class RouteSubscriber.
 *
 * @package Drupal\cgov_sitemap\Routing
 */
class RouteSubscriber extends RouteSubscriberBase {

  /**
   * Provides access to information about which site we're on.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * RouteSubscriber constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   Access to information about which site we're running under.
   */
  public function __construct(ConfigFactoryInterface $config_factory) {
    $this->configFactory = $config_factory;
  }

  /**
   * {@inheritdoc}
   *
   * If this is the c.gov site, replace the simple_sitemap
   * file with an index for all the site maps.
   */
  public function alterRoutes(RouteCollection $collection) {
    $config = $this->configFactory->get('cgov_core.site_config');
    if ($config->get('site') === 'cgov') {
      $route = $collection->get('simple_sitemap.sitemap_default');
      if (!empty($route)) {
        $controller = '\Drupal\cgov_sitemap\Controller\SitemapIndex::index';
        $route->setDefaults(['_controller' => $controller]);
      }
    }
  }

}
