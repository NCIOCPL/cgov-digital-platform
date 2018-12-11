<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Routing\CurrentRouteMatch;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a block with page options.
 *
 * @Block(
 *  id = "page_options",
 *  admin_label = "Page Options",
 * )
 */
class PageOptions extends BlockBase implements ContainerFactoryPluginInterface {

  public $currentNodeType = '';

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('current_route_match')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, CurrentRouteMatch $route_match) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->currentNodeType = $route_match->getParameter('node')->getType();
  }

  /**
   * {@inheritdoc}
   */
  public function getPageOptionsForPageType($nodeType) {
    switch ($nodeType) {
      case 'cgov_article':
        return ['article', 'page'];

      case 'cgov_home_landing':
        return ['home', 'landing'];

    }
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#options' => $this->getPageOptionsForPageType($this->currentNodeType),
    ];
  }

}
