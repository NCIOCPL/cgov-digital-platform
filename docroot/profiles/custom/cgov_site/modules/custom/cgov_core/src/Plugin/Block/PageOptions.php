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

  protected $routeMatch;

  public $currentNodeType = 'test';

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
    $this->routeMatch = $route_match;
  }

  /**
   * {@inheritdoc}
   */
  public function getNodeType() {
    $nid = '';
    // $node = $this->routeMatch()->getParameter('node');
    // if ($node instanceof NodeInterface) {
    // $nid = $node->getType();
    // }
    return $nid;
  }

  /**
   * {@inheritdoc}
   */
  public function getPageOptionsForPageType($nodeType) {
    return $nodeType;
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
