<?php

namespace Drupal\cgov_blog\Services;

use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Drupal\node\NodeInterface;

/**
 * Blog Manager 2 Service.
 */
class BlogManager2 implements BlogManager2Interface {

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
   * @var \Drupal\path_alias\AliasManagerInterface
   */
  protected $aliasManager;


  /**
   * Language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * An HTTP request.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Constructor for BlogManager object.
   *
   * @param \Drupal\Core\Entity\EntityRepositoryInterface $entity_repository
   *   The entity repository.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager service.
   * @param \Drupal\Core\Routing\RouteMatchInterface $route_matcher
   *   The route matcher.
   * @param \Drupal\path_alias\AliasManagerInterface $alias_manager
   *   The path alias manager.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   An HTTP request.
   */
  public function __construct(
    EntityRepositoryInterface $entity_repository,
    EntityTypeManagerInterface $entity_type_manager,
    RouteMatchInterface $route_matcher,
    AliasManagerInterface $alias_manager,
    LanguageManagerInterface $language_manager,
    RequestStack $request_stack
  ) {
    $this->entityRepository = $entity_repository;
    $this->entityTypeManager = $entity_type_manager;
    $this->routeMatcher = $route_matcher;
    $this->aliasManager = $alias_manager;
    $this->languageManager = $language_manager;
    $this->requestStack = $request_stack;
  }

  /**
   * {@inheritdoc}
   */
  public function getSeriesFromRoute() {
    $value = NULL;

    // Grab the current route context.
    $route_contexts = $this->routeMatcher->getRouteObject()->getOption('parameters');

    if (isset($route_contexts['node'])) {
      // We have a node entity in our route parameters.
      $node = $this->routeMatcher->getParameter('node');
      if ($node->bundle() === 'cgov_blog_series') {
        $value = $node;
      }
      elseif ($node->bundle() === 'cgov_blog_post') {
        // The node contains the field "field_blog_series".
        $reference = $node->field_blog_series->referencedEntities();
        if (isset($reference[0]) && $reference[0] instanceof NodeInterface) {
          // A referenced entity exists.
          $value = $reference[0];
        }
      }
    }

    return $value;
  }

  /**
   * {@inheritdoc}
   */
  public function getTopicsBySeries($blog_series) {
    return $this->GetTopicsBySeriesId($blog_series->id());
  }

  /**
   * {@inheritdoc}
   */
  public function getTopicsBySeriesId($id) {
    // Get all associated categories.
    $activeTopics = $this->getAllTopics($id);
    $rtn_topics = [];

    // Skip setting the category if there are 0 posts for this language.
    foreach ($activeTopics as $key => $topic) {
      // Query for nodes with this category in the current language context.
      $query = $this->entityTypeManager->getStorage('node')->getQuery();
      $nodes = $query
        ->accessCheck(FALSE)
        ->condition('type', 'cgov_blog_post')
        ->condition('status', 1)
        ->condition("field_blog_topics", $topic->id())
        ->execute();
      // Remove the category if there are zero usages.
      if (!empty($nodes)) {
        $rtn_topics[$key] = $topic;
      }
    }

    return $rtn_topics;
  }

  /**
   * {@inheritdoc}
   */
  public function getAllTopics($id) {
    $taxonomy_storage = $this->entityTypeManager->getStorage('taxonomy_term');
    $taxonomy = $taxonomy_storage->loadTree('cgov_blog_topics') ?? NULL;

    $topics = [];
    // I remember we had done a query that gets the ids of all of the topics
    // if the 'field_owner_blog' = blog_series_id
    // Create an array of topics that match the owner Blog Series.
    if (count($taxonomy) > 0) {
      foreach ($taxonomy as $taxon) {
        // @todo Need to remove get from here.
        $owner_nid = $taxon->get('field_owner_blog')->target_id;
        if ($id == $owner_nid) {
          $topics[] = $taxon;
        }
      }
    }
    return $topics;
  }

}
