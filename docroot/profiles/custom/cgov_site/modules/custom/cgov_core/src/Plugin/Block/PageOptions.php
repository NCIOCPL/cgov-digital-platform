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

  private static $nodeOptions = [
    'cgov_home_landing' => [
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
    'cgov_article' => [
      'resize',
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
  ];

  private static $optionConfigs = [
    'facebook' => 'true',
    'twitter' => 'true',
    'email' => 'true',
    'resize' => 'true',
    'print' => 'true',
    'pinterest' => 'true',
  ];

  /**
   * Build array of page options configurations.
   *
   * @param array $options
   *   Page options used on current node.
   *
   * @return array
   *   An associative array of configurations
   */
  private static function getOptionsConfigMap(array $options) {
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
   * Get page options config array for valid node types.
   *
   * If a given node type does not have registered page options
   * configurations return an empty array. Otherwise return an
   * associative array mapping the page option types to their
   * individual configuration specifics.
   *
   * @param string $nodeType
   *   The current node/page/view type:
   *   - examples: cgov_article, cgov_home_landing, etc.
   *
   * @return array
   *   An associative array of configuration specifics.
   */
  public function getPageOptionsForPageType(string $nodeType) {
    if (array_key_exists($nodeType, self::$nodeOptions)) {
      $nodeOptions = self::$nodeOptions[$nodeType];
      return self::getOptionsConfigMap($nodeOptions);
    }
    return [];
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
