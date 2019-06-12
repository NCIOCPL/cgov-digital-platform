<?php

namespace Drupal\cgov_core\Services;

use Drupal\Core\Path\AliasManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityRepository;
use Drupal\Core\Path\CurrentPathStack;
use Drupal\taxonomy\TermInterface;
use Drupal\cgov_core\NavItem;
use Psr\Log\LoggerInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Language\LanguageManagerInterface;

/**
 * Cgov Navigation Manager Service.
 *
 * Use to retrieve information and entities related to the Site Section
 * taxonomy term tree.
 * The closest Site Section Term and Term Ancestry Tree will be
 * memoized for the duration of this request to be shared between
 * navigation block plugins.
 */
class CgovNavigationManager {

  /**
   * Am I initialized.
   *
   * @var bool
   */
  protected $initialized;

  /**
   * Aliased path for current request.
   *
   * @var string
   */
  protected $currentPathAlias;

  /**
   * Interface Language.
   *
   * @var string
   */
  protected $interfaceLanguage;

  /**
   * Site Section closest to current request path.
   *
   * @var \Drupal\taxonomy\TermInterface|null
   */
  protected $closestSiteSection;

  /**
   * Array of ancestors from root to current.
   *
   * We initialize it as an empty array to save a few
   * extra guard checks for methods that loop over this
   * array. Those would fail in the case of some methods
   * being called during a request not associated with any
   * Site Sections.
   *
   * @var \Drupal\taxonomy\TermInterface[]
   */
  protected $fullAncestry = [];

  /**
   * Retrieve raw path for the current request.
   *
   * @var \Drupal\Core\Path\CurrentPathStack
   */
  protected $currentPath;

  /**
   * Path alias manager.
   *
   * @var \Drupal\Core\Path\AliasManagerInterface
   */
  protected $pathAliasManager;

  /**
   * Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Entity Field Manager.
   *
   * @var \Drupal\Core\Entity\EntityFieldManagerInterface
   */
  protected $entityFieldManager;

  /**
   * Logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * Entity Repository.
   *
   * @var \Drupal\Core\Entity\EntityRepository
   */
  protected $entityRepository;

  /**
   * Constructs a new CgovNavigationManager class.
   */
  public function __construct(
    CurrentPathStack $currentPath,
    AliasManagerInterface $pathAliasManager,
    EntityTypeManagerInterface $entityTypeManager,
    EntityFieldManagerInterface $entityFieldManager,
    LoggerInterface $logger,
    LanguageManagerInterface $languageManager,
    EntityRepository $entityRepository
    ) {
    $this->currentPath = $currentPath;
    $this->pathAliasManager = $pathAliasManager;
    $this->entityTypeManager = $entityTypeManager;
    $this->entityFieldManager = $entityFieldManager;
    $this->logger = $logger;
    $this->languageManager = $languageManager;
    $this->entityRepository = $entityRepository;
  }

  /**
   * Setup current instance.
   */
  protected function initialize() {
    if ($this->initialized) {
      return;
    }
    $this->initialized = TRUE;
    // We want to look up site sections by interface language, but
    // we only need to do it once and cache the result locally.
    $this->interfaceLanguage = $this->languageManager->getCurrentLanguage(LanguageInterface::TYPE_INTERFACE);
    $this->currentPathAlias = $this->getCurrentPathAlias();
    $this->closestSiteSection = $this->getClosestSiteSection();
    // Guard against when this service is called inadvertantly by
    // a request from an entity not associated with the Site Section
    // vocabulary.
    if ($this->closestSiteSection) {
      $this->fullAncestry = $this->getTermAncestry($this->closestSiteSection);
    }
  }

  /**
   * Determine the aliased path for the current request.
   *
   * @return string
   *   Returns aliased path.
   */
  public function getCurrentPathAlias() {
    $this->initialize();
    /* @var string */
    $path = $this->currentPath->getPath();
    /* @var string */
    $aliasedPath = $this->pathAliasManager->getAliasByPath($path);
    return $aliasedPath;
  }

  /**
   * Retrieve closest Site Section Term by aliased path.
   *
   * Using the aliased path, we walk up the url (towards root)
   * ancestry until we find the first Site Section
   * matching the path fragment.
   *
   * @return \Drupal\taxonomy\TermInterface|null
   *   Get closest site section. This should always
   *   at least return the root site section, but
   *   just in case...
   */
  public function getClosestSiteSection() {
    $this->initialize();
    /* @var \Drupal\taxonomy\TermInterface|null */
    $siteSection = NULL;
    $pathFragments = explode('/', trim($this->currentPathAlias, '/'));
    for ($i = 0; $i <= count($pathFragments); $i++) {
      $pathTest = '/' . implode('/', array_slice($pathFragments, 0, count($pathFragments) - $i));
      /* @var \Drupal\taxonomy\TermInterface */
      $siteSection = $this->getSiteSectionByComputedPath($pathTest);
      if ($siteSection) {
        break;
      }
    }
    return $siteSection;
  }

  /**
   * Retrieve Site Section by path.
   *
   * @param string $path
   *   Aliased path to look up in computed_path field
   *   on Site Section Terms.
   *
   * @return \Drupal\taxonomy\TermInterface|null
   *   Term with computed_path field value matching
   *   given path.
   */
  public function getSiteSectionByComputedPath(string $path) {
    $this->initialize();
    /* @var \Drupal\taxonomy\TermStorageInterface */
    $termStorage = $this->entityTypeManager->getStorage('taxonomy_term');
    $queryResults = $termStorage->loadByProperties(['computed_path' => $path, 'langcode' => $this->interfaceLanguage]);
    if (count($queryResults) === 0) {
      return;
    }
    // Something horrible has gone wrong if there is more
    // than one site section associated with an aliased path so we are
    // going to operate under the assumption that the associative array
    // returned by loadByProperties will either be empty or have exactly
    // one key value pair.
    $tid = array_keys($queryResults)[0];
    /* @var \Drupal\taxonomy\TermInterface */
    $term = $queryResults[$tid];
    return $term;
  }

  /**
   * Return ordered array of Ancestor Terms.
   *
   * Unfortunately, the built-in methods for TermStorage
   * only return flatmaps representing Term ancestry.
   * In order to return an ordered array, sorted
   * hierarchically, we need to walk up the parent chain
   * manually.
   *
   * NOTE: This method operates under the assumption that all
   * Site Sections can have only one parent. If that changes,
   * good luck.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   Base Term.
   *
   * @return \Drupal\taxonomy\TermInterface[]
   *   Array of term ids ordered from root->child
   *   representing the ancestry of a term.
   */
  public function getTermAncestry(TermInterface $term) {
    $this->initialize();
    /* @var \Drupal\taxonomy\TermInterface[] */
    $ancestry = [$term];
    /* @var \Drupal\taxonomy\TermInterface */
    $parentTerm = $this->getParentTerm($term);
    while ($parentTerm !== NULL) {
      $ancestry[] = $parentTerm;
      $parentTerm = $this->getParentTerm($parentTerm);
    }
    return $ancestry;
  }

  /**
   * Get parent of given term.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   Term to retrieve parent from.
   *
   * @return \Drupal\taxonomy\TermInterface
   *   Parent of provided term.
   */
  public function getParentTerm(TermInterface $term) {
    $this->initialize();
    /* @var \Drupal\taxonomy\TermStorageInterface */
    $termStorage = $this->entityTypeManager->getStorage('taxonomy_term');
    /* @var \Drupal\Core\Entity\EntityInterface[] */
    $parents = $termStorage->loadParents($term->id());
    // Load parents return an associative array where key is $tid
    // obviating the need to query the term itself for its id.
    if (count(array_keys($parents))) {
      /* @var \Drupal\taxonomy\TermInterface */
      return $parents[array_keys($parents)[0]];
    }
  }

  /**
   * Check if field name is valid.
   *
   * Just in case a call to this service passes
   * an invalid field name to use as a test
   * for determining something like nav root,
   * hide in nav, depth...
   *
   * @param string $fieldName
   *   Field name.
   *
   * @return bool
   *   Represents valid field on site section term entity.
   */
  public function isValidSiteSectionField(string $fieldName) {
    $this->initialize();
    /* @var \Drupal\Core\Field\FieldDefinitionInterface[] */
    $definitions = $this->entityFieldManager->getFieldDefinitions('taxonomy_term', 'cgov_site_sections');
    return isset($definitions[$fieldName]);
  }

  /**
   * Test if current path can reach any site section.
   *
   * If walking up the path never finds a valid
   * site section, the current page is not a part
   * of the site's navigation structure using the site
   * section vocabulary. Therefore any plugins relying
   * on this service should be disabled.
   *
   * @return bool
   *   Whether current path is a part of navigation tree.
   */
  public function getCurrentPathIsInNavigationTree() {
    $this->initialize();
    return $this->closestSiteSection !== NULL;
  }

  /**
   * Get Nav Root Term.
   *
   * Provide the appropriate field for which you
   * want the nav root Term. eg 'field_breadcrumb_root'.
   *
   * @param string $testFieldName
   *   Name of field to check for root status.
   *
   * @return \Drupal\cgov_core\NavItemInterface|null
   *   Nav Item representing nav root term.
   */
  public function getNavRoot(string $testFieldName) {
    $this->initialize();
    if ($this->isValidSiteSectionField($testFieldName)) {
      foreach ($this->fullAncestry as $term) {
        $isNavRoot = $term->{$testFieldName}->value;
        if ($isNavRoot) {
          $navItem = $this->newNavItem($term);
          return $navItem;
        }
      }
    }
  }

  /**
   * Create new NavItem.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   Base Term to wrap.
   *
   * @return \Drupal\cgov_core\NavItemInterface
   *   Nav Item wrapping given Term.
   */
  public function newNavItem(TermInterface $term) {
    $this->initialize();
    $isInActivePath = $this->isTermInActivePath($term);
    return new NavItem($this, $term, $isInActivePath);
  }

  /**
   * Get active path status for Term.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   Term.
   *
   * @return bool
   *   TRUE if given term is in active path.
   */
  public function isTermInActivePath(TermInterface $term) {
    $this->initialize();
    $termId = $term->id();
    $isInActivePath = FALSE;
    foreach ($this->fullAncestry as $ancestor) {
      $ancestorId = $ancestor->id();
      if ($termId === $ancestorId) {
        $isInActivePath = TRUE;
      }
    }
    return $isInActivePath;
  }

  /**
   * Test if Term is base Term for current request.
   *
   * The Navigation Manager service caches the site
   * section closest to the page for the current HTTP
   * request. This tests whether a given Term matches
   * the cached Term.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   Term.
   *
   * @return bool
   *   Return TRUE if given Term matches cached.
   */
  public function isCurrentSiteSection(TermInterface $term) {
    $this->initialize();
    return $this->closestSiteSection->id() === $term->id();
  }

  /**
   * Test closest site section landing page is current request path.
   *
   * In some instances, we might want to know whether or not the
   * current request is from the landing page of a site section or
   * from a page which defines a pretty url.
   *
   * We could determine this by retrieving the current entity being
   * rendered and seeing if it has a field_pretty_url value set (in
   * which case it would not be a landing page). However, a much
   * simpler approach is to simply test whether the closest site section
   * has a computed path that matches the full aliased path of the
   * current request.
   *
   * @return bool
   *   Bool.
   */
  public function isCurrentSiteSectionLandingPage() {
    $this->initialize();
    return $this->closestSiteSection->computed_path->value === $this->currentPathAlias;
  }

  /**
   * Get immediate children of given Term.
   *
   * Given a Term, return all immediate descendent Terms,
   * excepting those that do not have an assigned landing
   * page.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   Term.
   *
   * @return \Drupal\taxonomy\TermInterface[]
   *   Children terms filtered that have an
   *   associated landing page.
   */
  public function getChildTerms(TermInterface $term) {
    $this->initialize();
    $parentId = $term->id();
    $termStorage = $this->entityTypeManager->getStorage('taxonomy_term');
    $childrenMap = $termStorage->loadChildren($parentId);
    // We want a simple list instead of id keyed assoc array.
    $childrenList = [];
    foreach ($childrenMap as $childTerm) {
      /*
       * Only site sections with landing pages can have a link.
       * Nav plugins should never be calling getHref on NavItems without landing
       * pages (since those are filtered ).
       * By calling entity we ensure we're not trying to build a navitem
       * from an invalid or non-existent entity reference.
       *
       * NOTE: This is kind of a hack. There is a lot of logic for determining
       * what to get the URL for. So we in essence have to do this twice, once
       * to determine if we have a proper URL, and once in NavItem when setting
       * the URL.
       */

      $landingUrl = $this->getUrlForLanding($childTerm);

      if ($landingUrl) {
        $childrenList[] = $childTerm;
      }
    }
    return $childrenList;
  }

  /**
   * Get the URL of a Terms Landing Page.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   The term to get the URL for.
   *
   * @return \Drupal\Core\Url
   *   The Url for the landing page of the term. NULL if it is not acccessible.
   */
  public function getUrlForLanding(TermInterface $term) {

    $landingPage = $term->field_landing_page->entity;
    if ($landingPage) {
      // Set the entity in the correct language for display.
      if ($this->isTranslatableInterface($landingPage)) {
        $landingPage = $this->entityRepository->getTranslationFromContext($landingPage, $this->interfaceLanguage->getId());
      }
      $access = $landingPage->access('view', NULL, TRUE);
      if ($access->isAllowed()) {
        return $landingPage->toUrl();
      }
    }

    return NULL;
  }

  /**
   * Checks if an entity implements TranslatableInterface.
   *
   * Why, oh, why does instanceof not work correctly?
   *
   * @param object $entity
   *   The entity to test.
   *
   * @return bool
   *   TRUE if it implements the interface, false if not.
   */
  private function isTranslatableInterface($entity) {
    $class = new \ReflectionClass($entity);
    if (in_array('Drupal\Core\TypedData\TranslatableInterface', $class->getInterfaceNames())) {
      // If you find a ContentEntityInterface stop iterating and return it.
      return TRUE;
    }
    return FALSE;
  }

}
