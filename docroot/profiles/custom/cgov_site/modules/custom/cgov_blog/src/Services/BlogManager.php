<?php

namespace Drupal\cgov_blog\Services;

use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Blog Manager Service.
 */
class BlogManager implements BlogManagerInterface {

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
   * The path alias manager.
   *
   * @var \Drupal\path_alias\AliasManagerInterface
   */
  protected $aliasManager;

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $routeMatcher;

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
    RequestStack $request_stack,
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
  public function getBlogSeriesFromRoute() {
    $value = NULL;
    $node = $this->routeMatcher->getParameter('node');
    if ($node === NULL) {
      return NULL;
    }
    if ($node->bundle() === 'cgov_blog_series') {
      $value = $node;
    }
    elseif ($node->bundle() === 'cgov_blog_post') {
      // The node contains the field "field_blog_series".
      $reference = $node->field_blog_series->referencedEntities();
      if (isset($reference[0]) && $reference[0] instanceof NodeInterface && $reference[0]->bundle() === 'cgov_blog_series') {
        // A referenced entity exists.
        $value = $reference[0];
        $value = $value->getTranslation($this->languageManager->getCurrentLanguage()->getId());
      }
    }

    return $value;
  }

  /**
   * {@inheritdoc}
   */
  public function getSeriesPath(NodeInterface $blog_series, $queryParams = []) {
    $path = $blog_series->toUrl('canonical', ['query' => $queryParams]);
    return $path->toString();
  }

  /**
   * {@inheritdoc}
   */
  public function getTopicsBySeries(NodeInterface $series) {
    return $this->getTopicsBySeriesId($series->id(), $this->languageManager->getCurrentLanguage()->getId());
  }

  /**
   * {@inheritdoc}
   */
  public function getTopicsBySeriesId($id, $langcode) {
    $term_storage = $this->entityTypeManager->getStorage('taxonomy_term');
    $tids = $term_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('vid', 'cgov_blog_topics')
      ->condition('field_owner_blog.target_id', $id)
      ->condition('langcode', $langcode)
      ->execute();
    $terms = $term_storage->loadMultiple($tids);

    return $terms;
  }

  /**
   * {@inheritdoc}
   */
  public function getFilteredTopicsBySeries(NodeInterface $blog_series) {
    $topics = $this->getTopicsBySeries($blog_series);
    $rtn_topics = [];
    $langcode = $this->languageManager->getCurrentLanguage()->getId();
    foreach ($topics as $key => $term) {
      $node_storage = $this->entityTypeManager->getStorage('node');
      $node = $node_storage->getQuery()
        ->accessCheck(TRUE)
        ->condition('field_blog_topics', $term->id(), '=', $langcode)
        ->condition('type', 'cgov_blog_post')
        ->condition('status', 1)
        ->execute();
      // Remove the category if there are zero usages.
      if (!empty($node)) {
        $rtn_topics[$key] = $term->getTranslation($langcode);
      }
    }
    return $rtn_topics;
  }

  /**
   * {@inheritdoc}
   */
  public function getCurrentEntity() {
    return $this->routeMatcher->getParameter('node') ?? FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getSeriesFeaturedPosts(NodeInterface $blog_series) {
    $langcode = $this->languageManager->getCurrentLanguage()->getId();
    $featured_posts = [];
    $featured_posts_translated = [];
    if (!empty($blog_series->field_featured_posts)) {
      $featured_posts = $blog_series->field_featured_posts->referencedEntities();
    }
    foreach ($featured_posts as $key => $post) {
      $translated_post = $this->entityRepository->getTranslationFromContext($post, $langcode);
      $featured_posts_translated[$key] = $translated_post;
    }
    return $featured_posts_translated;
  }

  /**
   * {@inheritdoc}
   */
  public function getNodesByPostedDateDesc($type) {
    $query = $this->entityTypeManager->getStorage('node');
    $nids = $query->getQuery()
      ->accessCheck(TRUE)
      ->condition('status', 1)
      ->condition('type', $type)
      ->condition('langcode', $this->getCurrentEntity()->language()->getId())
      ->sort('field_date_posted', 'DESC')
      ->execute();
    $nodes = $query->loadMultiple($nids);
    return $nodes;
  }

  /**
   * {@inheritdoc}
   */
  public function getSeriesTopicByUrl(NodeInterface $blog_series) {

    // Retrieve the collection of associated topics and filter to match
    // against the topic query string parameter.
    $rtn = NULL;
    $filter = $this->requestStack->getCurrentRequest()->query->get('topic');
    $topics = $this->getTopicsBySeries($blog_series);

    // Get Blog Topic taxonomy terms in English and Spanish.
    foreach ($topics as $topic) {
      $tid = $topic->id();

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
   * {@inheritdoc}
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
      if (!$lang) {
        $langs = $this->getCurrentEntity()->language()->getId();
        $topic = $this->entityRepository->getTranslationFromContext($topic, $langs);
        return $topic;
      }
      $topic = $this->entityRepository->getTranslationFromContext($topic, $lang);
    }

    return $topic;
  }

  /**
   * {@inheritdoc}
   */
  public function getBlogPathFromNid($nid, $lang = NULL) {
    $path = "";
    $node = $this->getNodeFromNid($nid);
    if ($node !== NULL) {
      $path = $node->toUrl('canonical');
    }

    // Use alias manager otherwise.
    if ($path === "") {
      $path = (isset($lang)) ? $this->aliasManager->getAliasByPath('/node/' . $nid, $lang) :
        $this->aliasManager->getAliasByPath('/node/' . $nid);
    }
    return $path;
  }

  /**
   * {@inheritdoc}
   */
  public function getNodeFromNid($nid) {
    $storage = $this->entityTypeManager->getStorage('node');
    $nodeLoad = $storage->load($nid) ?? NULL;

    if ($nodeLoad instanceof Node) {
      $lang = $this->getCurrentEntity()->language()->getId();
      if ($nodeLoad->hasTranslation($lang)) {
        $nodeLoad = $nodeLoad->getTranslation($lang);
      }
    }
    return $nodeLoad;
  }

  /**
   * {@inheritdoc}
   */
  public function getNodesByPostedDateAsc($type) {
    $node_storage = $this->entityTypeManager->getStorage('node');
    $nids = $node_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('status', 1)
      ->condition('type', $type)
      ->condition('langcode', $this->getCurrentEntity()->language()->getId())
      ->sort('field_date_posted')
      ->execute();
    return $nids;
  }

  /**
   * {@inheritdoc}
   */
  public function getBlogSeriesTitle($month, $year, $includeTopic, $blog_series) {

    $title = "";
    // If url has topic or year add them to the title.
    if ($includeTopic or $year) {
      if ($year) {
        $title .= $month ? date('F', mktime(0, 0, 0, $month, 10)) : '';
        $title .= ' ' . $year . ' - ';
        $title .= ($blog_series->field_card_title->value) ? $blog_series->field_card_title->value : $blog_series->field_browser_title->value;
      }
      if ($includeTopic) {
        $topic_text = $this->getSeriesTopicByUrl($blog_series);
        if (isset($topic_text)) {
          $title .= $topic_text->getName() . ' - ';
          // Show card title if not empty. Otherwise show browser title field.
          $title .= ($blog_series->field_card_title->value) ? $blog_series->field_card_title->value : $blog_series->field_browser_title->value;
        }
        else {
          // Show card title if not empty. Otherwise show browser title field.
          $title = ($blog_series->field_card_title->value) ? $blog_series->field_card_title->value : $blog_series->field_browser_title->value;
          $title .= " - Error: Category Does Not Exist";
        }
      }
    }
    else {
      $title = $blog_series->getTitle();
    }
    return $title;
  }

}
