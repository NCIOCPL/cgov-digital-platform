<?php

namespace Drupal\cgov_blog\Services;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;

/**
 * Blog Manager Service.
 */
class BlogManager implements BlogManagerInterface {

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

  /**
   * An entity query.
   *
   * @var Drupal\Core\Entity\Query\QueryFactory
   */
  protected $entityQuery;

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructor for BlogManager object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   */
  public function __construct(
    EntityTypeManagerInterface $entity_type_manager,
    RouteMatchInterface $route_matcher) {
    $this->entityTypeManager = $entity_type_manager;
    $this->routeMatcher = $route_matcher;
  }

  /**
   * {@inheritdoc}
   */
  public function getCurrentEntity() {
    // BlogManagerInterface implementation.
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
   * {@inheritdoc}
   */
  public function getSeriesEntity() {
    $currEntity = $this->getCurrentEntity();
    $currId = $currEntity->id();
    $currBundle = $currEntity->bundle();

    // If this is a series.
    switch ($currBundle) {
      case 'cgov_blog_series':
        $seriesNode = $currEntity;
        break;

      case 'cgov_blog_post':
        $seriesNodeId = $this->getNodeStorage()->load($currId)->get('field_blog_series')->target_id;
        $seriesNode = $this->getNodeStorage()->load($seriesNodeId);
        break;

      default:
        $seriesNode = NULL;
        break;
    }
    return $seriesNode;
  }

  /**
   * Get the Blog Series ID.
   */
  public function getSeriesId() {
    $sid = getSeriesEntity();
    return $sid->id();
  }

  /**
   * Create a new node storage instance.
   *
   * @return Drupal\Core\Entity\EntityStorageInterface
   *   The node storage or NULL.
   */
  private function getNodeStorage() {
    $node_storage = $this->entityTypeManager->getStorage('node');
    return isset($node_storage) ? $node_storage : NULL;
  }

}
