<?php

namespace Drupal\cgov_core\Services;

use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Entity\ContentEntityInterface;

/**
 * Page Options Manager Service.
 */
class PageOptionsManager implements PageOptionsManagerInterface {

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

  protected $pageOptionsConfig = [];

  /**
   * TODO:.
   *
   * In future revisions, available options will be moved to the nodes
   * themselves, rather than be hardcoded here.
   *
   * @var array
   */
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
    'cgov_cancer_center' => [
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
    'cgov_biography' => [
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
    'cgov_event' => [
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
    'cgov_blog_post' => [
      'resize',
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
    'cgov_blog_series' => [
      'resize',
    ],
    'cgov_infographic' => [
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
    'pdq_cancer_information_summary' => [
      'resize',
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
    'pdq_drug_information_summary' => [
      'resize',
      'print',
      'email',
      'facebook',
      'twitter',
      'pinterest',
    ],
  ];

  private static $optionConfigs = [
    'facebook' => TRUE,
    'twitter' => TRUE,
    'email' => TRUE,
    'resize' => TRUE,
    'print' => TRUE,
    'pinterest' => TRUE,
  ];

  /**
   * Constructs a new Page Options Manager Service class.
   *
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_match
   *   The route match.
   */
  public function __construct(RouteMatchInterface $route_match) {
    $this->routeMatcher = $route_match;
    $currentEntity = $this->getCurrEntity();
    if ($currentEntity) {
      $bundleType = $currentEntity->bundle();
      $this->pageOptionsConfig = self::getPageOptionsForPageType($bundleType);
    }
  }

  /**
   * Gets the current entity if there is one.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  private function getCurrEntity() {
    $params = $this->routeMatcher->getParameters()->all();
    foreach ($params as $param) {
      if ($param instanceof ContentEntityInterface) {
        // If you find a ContentEntityInterface stop iterating and return it.
        return $param;
      }
    }
    return FALSE;
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
