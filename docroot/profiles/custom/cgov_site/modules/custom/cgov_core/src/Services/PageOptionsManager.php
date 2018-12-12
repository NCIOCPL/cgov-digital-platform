<?php

namespace Drupal\cgov_core\Services;

use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\node\NodeInterface;

/**
 * Page Options Manager Service.
 */
class PageOptionsManager {

  protected $pageOptionsConfig = [];

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
   * Constructs a new Page Options Manager Service class.
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The route match.
   */
  public function __construct(RouteMatchInterface $route_match) {
    $currentNode = $route_match->getParameter('node');
    if ($currentNode instanceof NodeInterface) {
      $currentNodeType = $currentNode->getType();
      $this->pageOptionsConfig = self::getPageOptionsForPageType($currentNodeType);
    }

  }

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
  private static function getPageOptionsForPageType(string $nodeType) {
    if (array_key_exists($nodeType, self::$nodeOptions)) {
      $nodeOptions = self::$nodeOptions[$nodeType];
      return self::getOptionsConfigMap($nodeOptions);
    }
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getConfig() {
    return $this->pageOptionsConfig;
  }

}
