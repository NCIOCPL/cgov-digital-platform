<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Routing\CurrentRouteMatch;
use Drupal\node\NodeInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\cgov_core\Services\PageOptionsManager;
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
  public $poResult = '';

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
      $container->get('current_route_match'),
      $container->get('cgov_core.page_options_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, CurrentRouteMatch $route_match, PageOptionsManager $po_manager) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $node = $route_match->getParameter('node');
    if ($node instanceof NodeInterface) {
      $this->currentNodeType = $node->getType();
    }
    $this->poResult = $po_manager->getConfig();
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
      // This is a hack to replicate the behavior currently on the site for
      // home and landing pages, which are exceptional.
      'hasColumnsLayout' => $this->currentNodeType === 'cgov_home_landing' ? TRUE : FALSE,
    ];
  }

}
