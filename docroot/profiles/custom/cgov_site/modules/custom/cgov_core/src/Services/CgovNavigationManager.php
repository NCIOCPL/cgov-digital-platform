<?php

namespace Drupal\cgov_core\Services;

use Drupal\cgov_core\NavItem;
use Drupal\Core\Entity\EntityFieldManagerInterface;
use Drupal\Core\Entity\EntityRepository;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Path\CurrentPathStack;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\taxonomy\TermInterface;
use Psr\Log\LoggerInterface;

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
   * Array of ancestors from current to root.
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
   * @var \Drupal\path_alias\AliasManagerInterface
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
    EntityRepository $entityRepository,
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
    /** @var string */
    $path = $this->currentPath->getPath();
    /** @var string */
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
    /** @var \Drupal\taxonomy\TermInterface|null */
    $siteSection = NULL;
    $pathFragments = explode('/', trim($this->currentPathAlias, '/'));
    for ($i = 0; $i <= count($pathFragments); $i++) {
      $pathTest = '/' . implode('/', array_slice($pathFragments, 0, count($pathFragments) - $i));
      /** @var \Drupal\taxonomy\TermInterface */
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
    /** @var \Drupal\taxonomy\TermStorageInterface */
    $termStorage = $this->entityTypeManager->getStorage('taxonomy_term');
    $queryResults = $termStorage->loadByProperties([
      'computed_path' => $path,
      'langcode' => $this->interfaceLanguage,
    ]);
    if (count($queryResults) === 0) {
      return;
    }
    // Something horrible has gone wrong if there is more
    // than one site section associated with an aliased path so we are
    // going to operate under the assumption that the associative array
    // returned by loadByProperties will either be empty or have exactly
    // one key value pair.
    $tid = array_keys($queryResults)[0];
    /** @var \Drupal\taxonomy\TermInterface */
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
    /** @var \Drupal\taxonomy\TermInterface[] */
    $ancestry = [$term];
    /** @var \Drupal\taxonomy\TermInterface */
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
    /** @var \Drupal\taxonomy\TermStorageInterface */
    $termStorage = $this->entityTypeManager->getStorage('taxonomy_term');
    /** @var \Drupal\Core\Entity\EntityInterface[] */
    $parents = $termStorage->loadParents($term->id());
    // Load parents return an associative array where key is $tid
    // obviating the need to query the term itself for its id.
    if (count(array_keys($parents))) {
      /** @var \Drupal\taxonomy\TermInterface */
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
    /** @var \Drupal\Core\Field\FieldDefinitionInterface[] */
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
   * Returns the active path for a primary nav.
   *
   * This is used by the NciPrimaryNavCacheContext.
   *
   * @return string
   *   This should be a string 'root_id:active_section_id',
   *   or 'root_id' if no active section.
   */
  public function getPrimaryNavActivePath() {
    $this->initialize();

    $navRoot = $this->findNavRootTerm('field_main_nav_root');

    // Handle the odd case where it has not been set.
    if (!$navRoot) {
      return '';
    }

    // Get the index of the root, the next item in the array would ve the next
    // menu item that would get highlighted.
    $idxRoot = array_search($navRoot, $this->fullAncestry, TRUE);
    if ($idxRoot !== FALSE) {
      if (($idxRoot - 1) >= 0) {
        // Make sure the child is not set as display in main nav false.
        $activeChild = $this->fullAncestry[$idxRoot - 1];
        $displayRules = $activeChild->field_navigation_display_options->getValue();

        if (
          array_search('hide_in_main_nav', $displayRules) === FALSE &&
          $this->getUrlForLanding($activeChild) !== NULL
          ) {
          // This items is navigable and not hidden in the nav, it will be
          // set as active.
          return $navRoot->id() . '|' . $activeChild->id();
        }
      }
      return (string) $navRoot->id();
    }

    // This should not get hit. The previous $navRoot existence
    // check should catch it.
    return '';
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
   * @return \Drupal\taxonomy\TermInterface|null
   *   The term matching the nav root condition.
   */
  protected function findNavRootTerm(string $testFieldName) {
    $this->initialize();
    if ($this->isValidSiteSectionField($testFieldName)) {
      foreach ($this->fullAncestry as $term) {
        $isNavRoot = $term->{$testFieldName}->value;
        if ($isNavRoot) {
          return $term;
        }
      }
    }
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
   * @return \Drupal\cgov_core\NavItem|null
   *   Nav Item representing nav root term.
   */
  public function getNavRoot(string $testFieldName) {
    $this->initialize();
    $rootTerm = $this->findNavRootTerm($testFieldName);
    if ($rootTerm) {
      return $this->newNavItem($rootTerm);
    }
  }

  /**
   * Gets the closest navigation, and initial menu item for mobile.
   *
   * This is an NCIDS helper function. Basically we do not want to display
   * any mobile menus that are just "Back" and "Explore Section". Whenever
   * we display a nav, we must always be displaying some children with
   * it. For the current page, this can either be the "Explore" link, or
   * one of the children under an explore link. If the closest nav is
   * just a single section, e.g., NCI Organizations, then we should actually
   * not chose that section. Instead we should choose the parent and the
   * nav can highlight the section within the parent menu.
   *
   * This actually will look close to the respose object for getParentNavInfo
   * from the CgovNavTreeController. The only difference in the logic is we
   * need to see if the nav we want to return would have any children.
   *
   * @return mixed
   *   An associative array representing the menu information needed by the
   *   NCIDS mobile menu.
   */
  public function getClosestNavForMobile() {
    $this->initialize();

    $closest_root = $this->getFirstNavRootWithChildren();

    // There was no nav closest. New site, no navs, this can happen.
    if ($closest_root === NULL) {
      return [];
    }

    $menu_type = $closest_root->field_main_nav_root->value ? 'mobile-nav' : 'section-nav';

    $initial_menu_info = [
      'id' => $closest_root->id(),
      'menu_type' => $menu_type,
    ];

    // Get the deepest active menu item.
    $initial_item = $this->getInitialMenuItemId(
      $closest_root,
      $menu_type === 'mobile-nav' ?
        'mobile_nav' :
        'section_nav',
      $menu_type === 'mobile-nav' ?
        (theme_get_setting('mobile_levels_to_display', 'cgov_common') ?? 4) + 1 :
        $closest_root->field_levels_to_display->value ?? 5
    );

    return [
      'initial_nav' => $initial_menu_info,
      'initial_item' => $initial_item,
    ];
  }

  /**
   * Gets the deepest displayed menu item.
   *
   * The deepest displayed menu item will always be along the navigation path.
   * (i.e. fullAncestry)
   *
   * @param \Drupal\taxonomy\TermInterface $root_term
   *   The root of the menu.
   * @param string $menu_type
   *   The menu type, 'section_nav' or 'mobile_nav'.
   * @param int $max_depth
   *   The maximum depth of this nav.
   *
   * @return string
   *   The ID of the term that is the deepest displayed menu item.
   */
  protected function getInitialMenuItemId(TermInterface $root_term, $menu_type, $max_depth) {
    $menu_filter = 'hide_in_' . $menu_type;

    // We have a root. Now we need to figure out where we fall in the tree.
    $root_idx = array_search($root_term, $this->fullAncestry, TRUE);

    // If the root idx is 0, then the URL being viewed is the landing page for
    // root, so we can just return the id of the root. If we hit this condition
    // the the root must have children.
    if ($root_idx === 0) {
      return $root_term->id();
    }

    // We next want to take a slice of the branch. So get the entire branch and
    // flip it.
    $branch_arr = array_reverse(array_slice($this->fullAncestry, 0, $root_idx + 1));

    // PHP's reduce fuction and how it handles closures is ugly. So we will just
    // use a loop to build up the array.
    $filtered_branch = [];
    foreach ($branch_arr as $level => $term) {

      // If this item is past the max depth then we need to stop.
      // Arrays are 0-based indexes, but levels start at one, since we are
      // using the index, we must always add 1 to the index to get a level.
      if ($level + 1 > $max_depth) {
        break;
      }

      // If this item is hidden in the nav, we need to stop. We can't do this
      // check on the root of the nav though since it can be hidden in its
      // root type.
      if ($level !== 0) {
        $display_options = $this->getNavigationDisplayOptions($term);
        if (in_array($menu_filter, $display_options)) {
          break;
        }
      }

      // If this item does not have a valid landing page, we need to stop.
      if ($this->getUrlForLanding($term) === NULL) {
        break;
      }

      // This term would appear in the navigation, so continue.
      $filtered_branch[] = $term;
    }

    // At this point, we know that the id to return will either be the last
    // element of the array IF there would be a child to display.
    // Otherwise it is the second to last element.
    if (count($filtered_branch) === 0) {
      // This is an error condition that should not ever hit. This would get
      // tripped if the caller did not check if the root has a valid URL.
      return -1;
    }
    elseif (count($filtered_branch) === 1) {
      // This is if we are a child of the root, the root has children, but
      // this path is hidden.
      return $filtered_branch[0]->id();
    }
    elseif (count($filtered_branch) == $max_depth) {
      // In this case the last element is the end of this branch, so it can't
      // have children.
      return $filtered_branch[count($filtered_branch) - 2]->id();
    }

    // At this point, the last term *could* have a child. Remember we don't
    // actually have the full nav tree -- we only have the branch of the
    // that gets us to the current URL. So we need to get the kids and see
    // if one could show.
    $hasChild = $this->hasDisplayableChildren($filtered_branch[count($filtered_branch) - 1], $menu_filter);
    if ($hasChild) {
      return $filtered_branch[count($filtered_branch) - 1]->id();
    }
    else {
      return $filtered_branch[count($filtered_branch) - 2]->id();
    }
  }

  /**
   * Helper function to determine the closest Nav Root that would show children.
   *
   * @return \Drupal\taxonomy\TermInterface|null
   *   The closest term.
   */
  protected function getFirstNavRootWithChildren() {
    $this->initialize();

    foreach ($this->fullAncestry as $parent_term) {
      // Must be a nav root.
      $isNavRoot = ($parent_term->field_main_nav_root->value || $parent_term->field_section_nav_root->value);
      if (!$isNavRoot) {
        continue;
      }
      // Must have a landing page.
      $path = $this->getUrlForLanding($parent_term);
      if ($path === NULL) {
        continue;
      }
      // At this point we know it is a nav. However, we don't know how
      // much it will show. We do want to cut down on the calls we need
      // to make to the Backend. With 1 level of children we should be
      // able to tell if we are good or not. Main nav and section nav
      // are handled differently.
      if ($parent_term->field_main_nav_root->value) {
        // For a mobile nav, the root is the start. So if we only should show 1
        // level, then we need the depth to be 2 to show any children.
        $depth = (theme_get_setting('mobile_levels_to_display', 'cgov_common') ?? 4) + 1;
        if ($depth <= 2) {
          continue;
        }

        if ($this->hasDisplayableChildren($parent_term, 'hide_in_mobile_nav')) {
          return $parent_term;
        }
      }
      else {
        // If the section nav only display 1 level, we know it had no
        // children.
        $depth = $parent_term->field_levels_to_display->value ?? 5;
        if ($depth <= 1) {
          continue;
        }

        if ($this->hasDisplayableChildren($parent_term, 'hide_in_section_nav')) {
          return $parent_term;
        }
      }
    }

    return NULL;
  }

  /**
   * Helper function to determine if a term has displayable children.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   The taxonomy term to check.
   * @param string $menu_filter
   *   The display option used to filter results.
   *
   * @return bool
   *   TRUE if there is at least 1 displayable child.
   */
  protected function hasDisplayableChildren(TermInterface $term, $menu_filter) {
    // getChildTerms filters out children without landing urls.
    $children = $this->getChildTerms($term);

    foreach ($children as $child) {
      $displayRules = $this->getNavigationDisplayOptions($child);
      if (!in_array($menu_filter, $displayRules)) {
        return TRUE;
      }
    }

    return FALSE;
  }

  /**
   * Gets the navigation display options for a term.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   The taxonomy term to get the options for.
   *
   * @return array
   *   The options.
   */
  protected function getNavigationDisplayOptions(TermInterface $term) {
    // Get the available navigation display options of the current term.
    $navigation_display_options = [];
    // Make sure the field has value.
    if ($term->get('field_navigation_display_options')->getValue()) {
      $display_options = $term->get('field_navigation_display_options')->getValue();
      $navigation_display_options = array_column($display_options, 'value');
    }
    return $navigation_display_options;
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
    return $this->isTermIdInActivePath($termId);
  }

  /**
   * Get active path status for Term by its ID.
   *
   * @param string|int $termId
   *   The ID of the term.
   *
   * @return bool
   *   TRUE if given term is in active path.
   */
  public function isTermIdInActivePath($termId) {
    $this->initialize();
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
        $current_lang = $this->interfaceLanguage->getId();
        if ($landingPage->hasTranslation($current_lang)) {
          $landingPage = $landingPage->getTranslation($current_lang);
        }
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
