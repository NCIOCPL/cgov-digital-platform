<?php

namespace Drupal\cgov_core;

use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\Component\Utility\Html;
use Drupal\taxonomy\TermInterface;

/**
 * Nav Item.
 *
 * Custom wrapper around native Site Section object
 * (currently Term Entities).
 */
class NavItem {

  /**
   * Cgov Navigation Manager service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navMgr;

  /**
   * Term this NavItem was generated from.
   *
   * @var \Drupal\taxonomy\TermInterface
   */
  protected $term;

  /**
   * Id of base Term.
   *
   * @var int
   */
  protected $termId;

  /**
   * Current NavItem has associated landing page.
   *
   * @var int
   */
  protected $landingPageId;

  /**
   * TRUE if this NavItem is in active path.
   *
   * TRUE if this NavItem is in the direct
   * ancestry between Nav root and nav item
   * matching current HTTP request.
   *
   * @var bool
   */
  protected $isInCurrentPath;

  /**
   * TRUE if this is nav root for breadcrumbs.
   *
   * @var bool
   */
  protected $isBreadCrumbRoot;

  /**
   * TRUE if this is nav root for section navs.
   *
   * @var bool
   */
  protected $isSectionNavRoot;

  /**
   * TRUE if this is main nav root.
   *
   * @var bool
   */
  protected $isMainNavRoot;

  /**
   * Levels to render if this is root.
   *
   * @var int
   */
  protected $renderDepth;

  /**
   * Rules for hiding this NavItem.
   *
   * The default values here are provided as
   * reference, the entire array will be
   * overwritten on initialization.
   *
   * @var array
   */
  protected $displayRules = [
    'hide_in_mobile_nav' => FALSE,
    'hide_in_main_nav' => FALSE,
    'hide_in_section_nav' => FALSE,
  ];

  /**
   * Calculated display label for this NavItem.
   *
   * @var string
   */
  protected $label;

  /**
   * Calculated href path for this NavItem.
   *
   * @var \Drupal\Core\Url
   */
  protected $href;

  /**
   * Constructs a new instance of a Nav Item.
   *
   * @param \Drupal\cgov_core\Services\CgovNavigationManager $navMgr
   *   Instance of Navigation Manager service that created this
   *   NavItem.
   * @param \Drupal\taxonomy\TermInterface $term
   *   Site Section Term to wrap.
   * @param bool $isInCurrentPath
   *   TRUE if this NavItem is direct ancestor of site
   *   section closest to current request.
   */
  public function __construct(
    CgovNavigationManager $navMgr,
    TermInterface $term,
    bool $isInCurrentPath,
  ) {
    $this->navMgr = $navMgr;
    $this->isInCurrentPath = $isInCurrentPath;
    $this->initialize($term);
  }

  /**
   * Initialize Nav Item.
   *
   * Map Term fields to Nav Item properties.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   Term to map NavItem properties to.
   */
  protected function initialize(TermInterface $term) {
    // @todo Break some of these into their own protected functions.
    // Or do we want the getters to all interact directly with the term
    // since there isn't much precalculation anyway.
    // @todo Error handle if fields don't exist.
    $this->term = $term;
    $this->termId = $this->term->id();

    $this->href = $this->navMgr->getUrlForLanding($this->term);

    $this->isBreadcrumbRoot = $this->term->field_breadcrumb_root->value;
    $this->isSectionNavRoot = $this->term->field_section_nav_root->value;
    $this->isMainNavRoot = $this->term->field_main_nav_root->value;
    $this->renderDepth = $this->term->field_levels_to_display->value;

    $this->label = $this->term->field_navigation_label->value
      ? $this->term->field_navigation_label->value
      : $this->term->name->value;

    /** @var [['value' => string], ['value' => string]] */
    $navigationDisplayRules = $this->term->field_navigation_display_options->getValue();
    $navigationDisplayRules = count($navigationDisplayRules) ? $navigationDisplayRules : [];
    // Populate a lookup table for easier reference later.
    foreach ($navigationDisplayRules as $rule) {
      $rule = $rule['value'];
      $this->displayRules[$rule] = TRUE;
    }
  }

  /**
   * Retrieve label property.
   *
   * @return string
   *   Label value.
   */
  public function getLabel() {
    return $this->label;
  }

  /**
   * Retrieve href property.
   *
   * @return string
   *   Href value.
   */
  public function getHref() {
    if ($this->href) {
      return $this->href->toString();
    }
    else {
      return '';
    }
  }

  /**
   * Retrieve Term weight.
   *
   * @return int
   *   Term weight.
   */
  public function getWeight() {
    return $this->term->getWeight();
  }

  /**
   * Retrieve raw megamenu html markup.
   *
   * NOTE: This is for the Legacy cgov_common theme, NOT NCIDS.
   * The markup for megamenus are stored in content blocks as URI encoded raw
   * html. We need to retrieve it and unencode the html.
   *
   * @return string
   *   Megamenu content block markup.
   */
  public function getMegamenuContent() {
    $megamenuFieldEntityReference = $this->term->field_mega_menu_content;
    $referencedEntities = $megamenuFieldEntityReference->referencedEntities();
    $hasMegamenu = count($referencedEntities) > 0;
    if ($hasMegamenu) {
      $megamenuMarkupEncoded = $megamenuFieldEntityReference->entity->get('field_raw_html')->value;
      $megamenuMarkupDecoded = Html::decodeEntities($megamenuMarkupEncoded);
      return $megamenuMarkupDecoded;
    }
    return "";
  }

  /**
   * Indicates if this NavItem has NCIDS megamenu contents.
   *
   * @return bool
   *   True if there is data, false if not.
   */
  public function hasNcidsMegaMenu() {
    return !$this->term->field_ncids_mega_menu_contents->isEmpty();
  }

  /**
   * Retrieve isInCurrentPath property.
   *
   * @return bool
   *   Label value.
   */
  public function getIsInCurrentPath() {
    return $this->isInCurrentPath;
  }

  /**
   * Return depth to render from this root.
   *
   * @return int
   *   Render depth.
   */
  public function getRenderDepth() {
    return $this->renderDepth;
  }

  /**
   * Return the term.
   *
   * @return \Drupal\taxonomy\TermInterface
   *   Site Section Term.
   */
  public function getTerm() {
    return $this->term;
  }

  /**
   * Determine whether NavItem has filter rule.
   *
   * @param string $rule
   *   Display rule to test.
   *
   * @return bool
   *   Return TRUE if NavItem has display rule.
   */
  public function hasDisplayRule($rule) {
    $hasDisplayRule = isset($this->displayRules[$rule]) && $this->displayRules[$rule] === TRUE;
    return $hasDisplayRule;
  }

  /**
   * Test if this is current site section.
   *
   * Return TRUE if Navigation manager matches
   * the underlying term for this NavItem to
   * it's cached Term representing the closest
   * site section in the taxonomy tree for the
   * current request.
   *
   * @return bool
   *   Bool.
   */
  public function isCurrentSiteSection() {
    return $this->navMgr->isCurrentSiteSection($this->term);
  }

  /**
   * Test if this term is the landing page for current site section.
   *
   * For visual reasons section navigation requires distinguishing
   * between the state of being the closest site section in the
   * current path's ancestry and also being that section's landing page.
   *
   * @return bool
   *   Bool.
   */
  public function isCurrentSiteSectionLandingPage() {
    return $this->isCurrentSiteSection() && $this->navMgr->isCurrentSiteSectionLandingPage();
  }

  /**
   * Determines if this node is navigable.
   *
   * For now this really just means it has a URL.
   *
   * @return bool
   *   True if this item is navigable, false if not.
   */
  public function isNavigable() {
    return isset($this->href);
  }

  /**
   * Get immediate descendent NavItems.
   *
   * Optional, pass an array of class properties
   * with boolean values to filter children against.
   *
   * @return \Drupal\cgov_core\NavItemInterface[]
   *   Filtered array of direct descendents.
   */
  public function getChildren() {
    /** @var \Drupal\taxonomy\TermInterface[] */
    $allChildTerms = $this->navMgr->getChildTerms($this->term);
    // Build the navItems to make interacting with terms easier.
    $navItems = array_map(function ($term) {
      return $this->navMgr->newNavItem($term);
    }, $allChildTerms);
    return $navItems;
  }

  /**
   * Gets a navigation tree, based on this node.
   *
   * This implements all our filtering and visibility rules.
   *
   * @param int $maxDepth
   *   The maximum depth of the tree.
   * @param string $visibilityFilter
   *   The visibility to filter for. (e.g., hide_in_mobile_nav)
   * @param bool $includeRootInTree
   *   Indicator to include the root in the tree or not. (Default: TRUE)
   *
   * @return mixed
   *   This returns the tree as an array.
   */
  public function getAsNavTree($maxDepth, $visibilityFilter, $includeRootInTree = TRUE) {
    $tree = $this->getNavNode($this, $visibilityFilter, $maxDepth, 1);

    if (!$includeRootInTree) {
      return $tree['children'];
    }
    else {
      return $tree;
    }
  }

  /**
   * Gets the node (id, url, label, children) for a Nav Item.
   *
   * @param \Drupal\cgov_core\NavItem $navItem
   *   The navigation item to turn into a tree node.
   * @param string $visibilityFilter
   *   The visibility to filter for. (e.g., hide_in_mobile_nav)
   * @param int $maxDepth
   *   The maximum depth of the tree.
   * @param int $currentDepth
   *   The current level we are working on.
   *
   * @return mixed
   *   The nav tree.
   */
  private function getNavNode(NavItem $navItem, $visibilityFilter, $maxDepth, $currentDepth) {

    $children = [];

    if ($currentDepth < $maxDepth) {
      // The children are what we will display. God PHP has ugly array
      // functions. Remove items that should not show in the main nav.
      $filteredChildren = array_filter(
        $navItem->getChildren(),
        fn($item) => (!(
          ($visibilityFilter && $item->hasDisplayRule($visibilityFilter)) ||
          !$item->isNavigable()
        ))
      );

      // Sort them by the weight.
      usort($filteredChildren, ['self', "sortItemsByWeight"]);

      // Map them to a nice pretty array.
      $children = array_map(
        fn($item) => $this->getNavNode($item, $visibilityFilter, $maxDepth, $currentDepth + 1),
        $filteredChildren
      );
    }

    return [
      'id' => $navItem->getTerm()->id(),
      'label' => $navItem->getLabel(),
      'href' => $navItem->getHref(),
      'weight' => $navItem->getWeight(),
      'hasNcidsMegaMenu' => $navItem->hasNcidsMegaMenu(),
      'children' => $children,
    ];
  }

  /**
   * Generic sorting function to sort by Term weight.
   *
   * It's equivalent to reverse sort, since higher weights should
   * appear first.
   *
   * @param \Drupal\cgov_core\NavItem $firstItem
   *   Nav item.
   * @param \Drupal\cgov_core\NavItem $secondItem
   *   Nav item.
   *
   * @return int
   *   Sort result.
   */
  public static function sortItemsByWeight(NavItem $firstItem, NavItem $secondItem) {
    $firstWeight = $firstItem->getWeight();
    $secondWeight = $secondItem->getWeight();
    if ($firstWeight === $secondWeight) {
      return 0;
    }
    return ($firstWeight < $secondWeight) ? -1 : 1;
  }

}
