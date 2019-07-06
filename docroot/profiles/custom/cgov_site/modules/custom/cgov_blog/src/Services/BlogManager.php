<?php

namespace Drupal\cgov_blog\Services;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\Query\QueryFactory;
use Drupal\Core\Path\AliasManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\TypedData\TranslatableInterface;
use Symfony\Component\HttpFoundation\RequestStack;

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
   * The entity repository.
   *
   * @var \Drupal\Core\Entity\EntityRepositoryInterface
   */
  protected $entityRepository;

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
   * An HTTP request.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Constructor for BlogManager object.
   *
   * @param \Drupal\Core\Entity\Query\QueryFactory $entity_query
   *   An entity query.
   * @param \Drupal\Core\Entity\EntityRepositoryInterface $entity_repository
   *   The entity repository.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   * @param \Drupal\Core\Path\AliasManagerInterface $alias_manager
   *   The path alias manager.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   An HTTP request.
   */
  public function __construct(
    QueryFactory $entity_query,
    EntityRepositoryInterface $entity_repository,
    EntityTypeManagerInterface $entity_type_manager,
    RouteMatchInterface $route_matcher,
    AliasManagerInterface $alias_manager,
    RequestStack $request_stack
  ) {
    $this->entityQuery = $entity_query;
    $this->entityRepository = $entity_repository;
    $this->entityTypeManager = $entity_type_manager;
    $this->routeMatcher = $route_matcher;
    $this->aliasManager = $alias_manager;
    $this->requestStack = $request_stack;
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
    $seriesEntity = [];
    $currEntity = $this->getCurrentEntity();
    $currBundle = $currEntity->bundle();

    // If this is a series.
    switch ($currBundle) {
      case 'cgov_blog_series':
        $seriesEntity = $currEntity;
        break;

      case 'cgov_blog_post':
        $seriesEntity = $currEntity->field_blog_series->entity;
        $seriesEntity = $this->getCurrentTranslation($seriesEntity);
        break;

      default:
        break;
    }

    return $seriesEntity;
  }

  /**
   * {@inheritdoc}
   */
  public function getCurrentLang() {
    $currentLang = $this->getCurrentEntity()->language()->getId();
    return $currentLang;
  }

  /**
   * Gets the entity translation to be used in the given context.
   *
   * This will check whether a translation for the desired language
   * is available and if not, it will fall back to the most
   * appropriate translation based on the provided context.
   * Based on the implementation found in
   * EntityReferenceFormatterBase->getEntitiesToView().
   *
   * @return \Drupal\Core\Entity\EntityInterface
   *   A referenced entity.
   */
  public function getCurrentTranslation($node) {
    if ($node instanceof TranslatableInterface) {
      $lang = $this->getCurrentLang();
      $node = $this->entityRepository->getTranslationFromContext($node, $lang);
    }
    return $node;
  }

  /**
   * Create a node object given an nid.
   *
   * @param string $nid
   *   A node ID.
   *
   * @return Drupal\Core\Entity\EntityStorageInterface
   *   The node storage or NULL.
   */
  public function getNodeFromNid($nid) {
    $storage = $this->entityTypeManager->getStorage('node');
    $nodeLoad = (isset($storage)) ? $storage->load($nid) : NULL;
    $nodeLoad = $this->getCurrentTranslation($nodeLoad);
    return $nodeLoad;
  }

  /**
   * Get a single topic taxonomy object.
   *
   * @param string $tid
   *   A taxonomy term ID.
   * @param string $lang
   *   A language code (optional).
   */
  public function loadBlogTopic($tid, $lang = FALSE) {
    $taxonomy_storage = $this->entityTypeManager->getStorage('taxonomy_term');
    $topic = $taxonomy_storage->load($tid) ?? NULL;

    /*
     * Retrieve the translated taxonomy term in specified
     * language ($curr_langcode) with fallback to default
     * language if translation not exists.
     */
    if ($topic != NULL) {
      $langs = $lang ?? $this->getCurrentLang();
      $topic = $this->entityRepository->getTranslationFromContext($topic, $langs);
    }

    return $topic;
  }

  /**
   * Get all single topic taxonomy objects.
   *
   * @param string $vid
   *   A vocabulary ID.
   */
  public function loadAllBlogTopics($vid) {
    $taxonomy_storage = $this->entityTypeManager->getStorage('taxonomy_term');
    $topics = $taxonomy_storage->loadTree($vid) ?? NULL;
    return $topics;
  }

  /**
   * Get the Blog Series ID.
   */
  public function getSeriesId() {
    $series = $this->getSeriesEntity();
    $sid = '';
    if (isset($series)) {
      $sid = $series->id();
    }
    return $sid;
  }

  /**
   * The URL path for the blog series.
   *
   * @param mixed $queryParams
   *   An associative array of the URL query parameter.
   */
  public function getSeriesPath($queryParams = []) {
    $series = $this->getSeriesEntity();
    $path = $series->toUrl('canonical', ['query' => $queryParams]);
    return $path->toString();
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
   * Get Blog Series topics (cagtegories).
   */
  public function getSeriesTopics() {
    $topics = [];
    $curr_nid = $this->getSeriesId();
    $taxonomy = $this->loadAllBlogTopics('cgov_blog_topics');

    // Create an array of topics that match the owner Blog Series.
    if (count($taxonomy) > 0) {
      foreach ($taxonomy as $taxon) {
        $tid = $taxon->tid;
        $owner_nid = $this->loadBlogTopic($tid)->get('field_owner_blog')->target_id;
        if ($curr_nid == $owner_nid) {
          $topics[] = $taxon;
        }
      }
    }
    return $topics;
  }

  /**
   * Get Blog Series topic based on field_pretty_url.
   */
  public function getSeriesTopicByUrl() {
    // Get collection of associated topics and the filter from the URL.
    $rtn = NULL;
    $filter = $this->requestStack->getCurrentRequest()->query->get('topic');
    $topics = $this->getSeriesTopics();

    // Get Blog Topic taxonomy terms in English and Spanish.
    foreach ($topics as $topic) {
      $tid = $topic->tid;

      /*
       * If a filter match is found, return topic with the matching pretty URL.
       * LoadBlogTopic() returns the term matching the current node language.
       */
      $urlEn = $this->loadBlogTopic($tid, 'en')->field_topic_pretty_url->value ?? $tid;
      if ($urlEn === $filter) {
        $rtn = $this->loadBlogTopic($tid);
        break;
      }
      $urlEs = $this->loadBlogTopic($tid, 'es')->field_topic_pretty_url->value ?? $tid;
      if ($urlEs === $filter) {
        $rtn = $this->loadBlogTopic($tid);
        break;
      }

    }
    return $rtn;
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
    $node = $this->getNodeFromNid($nid);
    $path = (isset($node)) ? $node->toUrl('canonical') : NULL;

    // Use alias manager otherwise.
    if (!isset($path)) {
      $path = (isset($lang)) ? $this->aliasManager->getAliasByPath('/node/' . $nid, $lang) :
        $this->aliasManager->getAliasByPath('/node/' . $nid);
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
