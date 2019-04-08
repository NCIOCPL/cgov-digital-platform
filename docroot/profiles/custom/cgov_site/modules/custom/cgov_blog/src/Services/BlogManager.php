<?php

namespace Drupal\cgov_blog\Services;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Path\AliasManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;

/**
 * Blog Manager Service.
 */
class BlogManager implements BlogManagerInterface {

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
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

  /**
   * The path alias manager.
   *
   * @var \Drupal\Core\Path\AliasManagerInterface
   */
  protected $aliasManager;

  /**
   * Constructor for BlogManager object.
   *
   * @param \Drupal\Core\Entity\Query\QueryFactory $entity_query
   *   An entity query.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   * @param \Drupal\Core\Path\AliasManagerInterface $alias_manager
   *   The path alias manager.
   */
  public function __construct(
    QueryFactory $entity_query,
    EntityTypeManagerInterface $entity_type_manager,
    RouteMatchInterface $route_matcher,
    AliasManagerInterface $alias_manager
  ) {
    $this->entityQuery = $entity_query;
    $this->entityTypeManager = $entity_type_manager;
    $this->routeMatcher = $route_matcher;
    $this->aliasManager = $alias_manager;
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
        $seriesNodeId = $this->getNodeStorage()->load($currId)->field_blog_series->target_id;
        $seriesNode = $this->getNodeStorage()->load($seriesNodeId);
        break;

      default:
        $seriesNode = NULL;
        break;
    }
    return $seriesNode;
  }

  /**
   * {@inheritdoc}
   */
  public function getCurrentLang() {
    $currentLang = $this->getCurrentEntity()->language()->getId();
    return $currentLang;
  }

  /**
   * Create a new node storage instance.
   *
   * @return Drupal\Core\Entity\EntityStorageInterface
   *   The node storage or NULL.
   */
  public function getNodeStorage() {
    $node_storage = $this->entityTypeManager->getStorage('node');
    return isset($node_storage) ? $node_storage : NULL;
  }

  /**
   * Create a new taxonomy storage instance.
   *
   * @return Drupal\Core\Entity\EntityStorageInterface
   *   The taxonomy storage or NULL.
   */
  public function getTaxonomyStorage() {
    $taxonomy_storage = $this->entityTypeManager->getStorage('taxonomy_term');
    return isset($taxonomy_storage) ? $taxonomy_storage : NULL;
  }

  /**
   * Get the Blog Series ID.
   */
  public function getSeriesId() {
    $series = $this->getSeriesEntity();
    $series_id = (!empty($series->id())) ? $series->id() : '';
    return $series_id;
  }

  /**
   * The the URL path for the blog series.
   */
  public function getSeriesPath() {
    $nid = $this->getSeriesId();
    $path = $this->aliasManager->getAliasByPath('/node/' . $nid);
    return $path;
  }

  /**
   * Get the Blog Featured content nodes.
   */
  public function getSeriesFeaturedPosts() {
    $featured_posts = [];
    $series = $this->getSeriesEntity();
    if (!empty($series->field_featured_posts)) {
      $featured_posts = $series->field_featured_posts->referencedEntities();
    }
    return $featured_posts;
  }

  /**
   * Get Blog Series categories (topics).
   */
  public function getSeriesCategories() {
    $categories = [];
    $curr_nid = $this->getSeriesId();
    $taxonomy = $this->getTaxonomyStorage()->loadTree('cgov_blog_topics');

    // Create an array of categories that match the owner Blog Series.
    if (count($taxonomy) > 0) {
      foreach ($taxonomy as $taxon) {
        $tid = $taxon->tid;
        $owner_nid = $this->getTaxonomyStorage()->load($tid)->get('field_owner_blog')->target_id;
        if ($curr_nid === $owner_nid) {
          $categories[] = $taxon;
        }
      }
    }
    return $categories;
  }

  /**
   * Get Blog Series category (topic) descriptions.
   */
  public function getSeriesCategoryDescription() {
    $categories = $this->getSeriesCategories();
    $descriptions = [];

    // Create an array of categories that match the owner Blog Series.
    foreach ($categories as $cat) {
      $tid = $cat->tid;
      $url = $this->getTaxonomyStorage()->load($tid)->field_pretty_url->value;
      $desc = $this->getTaxonomyStorage()->load($tid)->description->value;
      $descriptions[$url] = $desc;
    }
    return $descriptions;
  }

  /**
   * The the URL path for a node based on NID.
   *
   * @param string $nid
   *   Node ID of content item.
   * @param string $lang
   *   Optional langcode.
   */
  public function getBlogPathFromNid($nid, $lang = NULL) {
    if (isset($lang)) {
      $path = $this->aliasManager->getAliasByPath('/node/' . $nid, $lang);
    }
    else {
      $path = $this->aliasManager->getAliasByPath('/node/' . $nid);
    }
    return $path;
  }

  /**
   * Return query results based on date posted.
   *
   * @param string $type
   *   Content type or bundle.
   */
  public function getNodesByPostedDateAsc($type) {
    $query = $this->entityQuery->get('node');
    $query->condition('status', 1);
    $query->condition('type', $type);
    $query->condition('langcode', $this->getCurrentLang());
    $query->sort('field_date_posted');
    $nids = $query->execute();
    return $nids;
  }

  /**
   * Return query results based on date posted.
   *
   * @param string $type
   *   Content type or bundle.
   */
  public function getNodesByPostedDateDesc($type) {
    $query = $this->entityQuery->get('node');
    $query->condition('status', 1);
    $query->condition('type', $type);
    $query->condition('langcode', $this->getCurrentLang());
    $query->sort('field_date_posted', 'DESC');
    $nids = $query->execute();
    return $nids;
  }

}
