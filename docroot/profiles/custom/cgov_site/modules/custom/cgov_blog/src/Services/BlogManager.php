<?php

namespace Drupal\cgov_blog\Services;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityRepositoryInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\node\Entity\Node;
use Drupal\node\NodeInterface;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\taxonomy\TermInterface;
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
  public function getCurrentEntity() {
    return $this->routeMatcher->getParameter('node') ?? FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getSeriesTopicByUrl(NodeInterface $blog_series) {
    $filter = $this->requestStack->getCurrentRequest()->query->get('topic');
    if (empty($filter)) {
      return NULL;
    }

    $raw_filter = trim((string) $filter);
    $clean_filter_name = str_replace('-', ' ', $raw_filter);
    $term_storage = $this->entityTypeManager->getStorage('taxonomy_term');

    // 1. Fetch the collection of associated topic terms mapped to this series.
    $topics = $this->getTopicsBySeries($blog_series);

    // 2. GLOBAL FALLBACK: If the node isn't tagged with
    // the term, load it globally from the vocabulary!
    if (empty($topics)) {
      if (is_numeric($raw_filter)) {
        // Path A: Load directly by numeric ID if provided.
        $global_term = $term_storage->load((int) $raw_filter);
        if ($global_term && $global_term->bundle() === 'cgov_blog_topics') {
          $topics = [$global_term];
        }
      }
      else {
        // Path B: Query globally across the pretty URL field first.
        $tids = $term_storage->getQuery()
          ->accessCheck(FALSE)
          ->condition('vid', 'cgov_blog_topics')
          ->condition('field_topic_pretty_url', $raw_filter)
          ->execute();
        // Path C: Fall back to querying globally by name.
        if (empty($tids)) {
          $tids = $term_storage->getQuery()
            ->accessCheck(FALSE)
            ->condition('vid', 'cgov_blog_topics')
            ->condition('name', $clean_filter_name)
            ->execute();
        }

        if (!empty($tids)) {
          $topics = $term_storage->loadMultiple($tids);
        }
      }
    }

    // 3. Scan the resolved terms to evaluate language variations.
    if (!empty($topics)) {
      foreach ($topics as $topic) {
        if (!$topic instanceof TermInterface) {
          continue;
        }

        $term_variants = [$topic];
        if ($topic instanceof ContentEntityInterface) {
          foreach ($topic->getTranslationLanguages() as $langcode => $language) {
            $term_variants[] = $topic->getTranslation($langcode);
          }
        }

        foreach ($term_variants as $variant) {
          // Strict Numeric ID match.
          if (is_numeric($raw_filter) && (int) $variant->id() === (int) $raw_filter) {
            return $topic;
          }

          // Pretty URL field match.
          if ($variant->hasField('field_topic_pretty_url') && !$variant->get('field_topic_pretty_url')->isEmpty()) {
            $pretty_url = trim((string) $variant->get('field_topic_pretty_url')->value);
            if (strcasecmp($pretty_url, $raw_filter) === 0) {
              return $topic;
            }
          }

          // Direct name or slug match.
          $term_name = trim((string) $variant->getName());
          if (strcasecmp($term_name, $clean_filter_name) === 0 || strcasecmp(str_replace('-', ' ', $term_name), $clean_filter_name) === 0) {
            return $topic;
          }
        }
      }
    }

    return NULL;
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
  public function getNodesByPostedDateAsc($type, $series_id) {
    $node_storage = $this->entityTypeManager->getStorage('node');
    $nids = $node_storage->getQuery()
      ->accessCheck(FALSE)
      ->condition('status', 1)
      ->condition('type', $type)
      ->condition('field_blog_series', $series_id)
      ->condition('langcode', $this->getCurrentEntity()->language()->getId())
      ->sort('field_date_posted')
      ->execute();
    return $nids;
  }

  /**
   * {@inheritdoc}
   */
  public function getBlogSeriesTitle($year, $includeTopic, $blog_series, $titleMode = self::TITLE_CARD) {
    // 1. Resolve Multilingual Translation Context.
    if ($blog_series instanceof ContentEntityInterface) {
      $langcode = $this->languageManager->getCurrentLanguage()->getId();
      if ($blog_series->hasTranslation($langcode)) {
        $blog_series = $blog_series->getTranslation($langcode);
      }
    }

    // 2. CHOOSE BASE TITLE ROUTE BASED ON TITLE MODE:
    $base_title = '';

    switch ($titleMode) {
      case self::TITLE_BROWSER:
        // Prioritize Browser Title field, fall back to native Title.
        if ($blog_series->hasField('field_browser_title') && !$blog_series->get('field_browser_title')->isEmpty()) {
          $base_title = $blog_series->get('field_browser_title')->value;
        }
        else {
          $base_title = $blog_series->getTitle();
        }
        break;

      case self::TITLE_NODE:
        // Use the standard native node title directly.
        $base_title = $blog_series->getTitle();
        break;

      case self::TITLE_CARD:
      default:
        // Maintain exact historical priority for Cards
        // (Card Title -> Browser Title -> Native Title).
        if ($blog_series->hasField('field_card_title') && !$blog_series->get('field_card_title')->isEmpty()) {
          $base_title = $blog_series->get('field_card_title')->value;
        }
        elseif ($blog_series->hasField('field_browser_title') && !$blog_series->get('field_browser_title')->isEmpty()) {
          $base_title = $blog_series->get('field_browser_title')->value;
        }
        else {
          $base_title = $blog_series->getTitle();
        }
        break;
    }

    // 3. Process Topic/Category matching rules if included in URL params.
    $prepend_items = [];
    if ($includeTopic) {
      $topic_text = $this->getSeriesTopicByUrl($blog_series);
      if (isset($topic_text)) {
        if ($topic_text instanceof ContentEntityInterface && $topic_text->hasTranslation($langcode)) {
          $topic_text = $topic_text->getTranslation($langcode);
        }
        $prepend_items[] = $topic_text->getName();
      }
      else {
        $base_title .= " - Error: Category Does Not Exist";
      }
    }

    // 4. Process Year configuration parameters.
    if ($year) {
      $clean_year = preg_replace('/[^0-9]/', '', (string) $year);
      if (!empty($clean_year)) {
        $prepend_items[] = $clean_year;
      }
    }

    // 5. Build queue and implode.
    $prepend_items[] = $base_title;
    return implode(' - ', $prepend_items);
  }

}
