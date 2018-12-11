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

  private static $optionConfigs = [
    'facebook' => 'true',
    'twitter' => 'true',
    'email' => 'true',
    'resize' => 'true',
    'print' => 'true',
    'pinterest' => 'true',
  ];

  /**
   * {@inheritdoc}
   */
  private static function getOptionsConfigMap($options) {
    $optionConfigs = self::$optionConfigs;
    $configMap = array_combine($options, array_map(function ($option) use ($optionConfigs) {
      return $optionConfigs[$option];
    }, $options));
    return $configMap;
  }

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
    $options = [];
    switch ($nodeType) {
      case 'cgov_article':
        $options = ['facebook', 'resize'];
        break;

      case 'cgov_home_landing':
        $options = ['email', 'twitter'];
        break;

    }
    if (count($options) > 0) {
      $options = self::getOptionsConfigMap($options);
    }
    return $options;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {
    return [
      '#type' => 'block',
      'options' => $this->getPageOptionsForPageType($this->currentNodeType),
    ];
  }

}
