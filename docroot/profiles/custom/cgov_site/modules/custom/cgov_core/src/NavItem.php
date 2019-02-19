<?php

namespace Drupal\cgov_core;

use Drupal\taxonomy\TermInterface;
use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\Component\Utility\Html;
use Drupal\Core\Url;

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
   * @var Drupal\taxonomy\TermInterface
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
   * @var string
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
    bool $isInCurrentPath
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
    // TODO: Break some of these into their own protected functions.
    // Or do we want the getters to all interact directly with the term
    // since there isn't much precalculation anyway.
    // TODO: Error handle if fields don't exist.
    $this->term = $term;
    $this->termId = $this->term->id();

    $hasLandingPage = count($this->term->field_landing_page->getValue()) && isset($this->term->field_landing_page->getValue()[0]['target_id']);
    if ($hasLandingPage) {
      $this->landingPageId = $this->term->field_landing_page->getValue()[0]['target_id'];
    }

    $this->isBreadcrumbRoot = $this->term->field_breadcrumb_root->value;
    $this->isSectionNavRoot = $this->term->field_section_nav_root->value;
    $this->isMainNavRoot = $this->term->field_main_nav_root->value;
    $this->renderDepth = $this->term->field_levels_to_display->value;

    $this->label = $this->term->field_navigation_label->value
      ? $this->term->field_navigation_label->value
      : $this->term->name->value;

    // Only site sections with landing pages can have a link.
    // Nav plugins should never be calling getHref on NavItems without landing
    // pages (since those are filtered )
    if ($this->landingPageId) {
      $href = Url::fromRoute('entity.node.canonical', ['node' => $this->landingPageId])->toString();
      $this->href = $href;
    }

    // @var [['value' => string], ['value' => string]]
    $navigationDisplayRules = $this->term->field_navigation_display_options->getValue();
    $navigationDisplayRules = count($navigationDisplayRules) ? $navigationDisplayRules : [];
    // Populate a lookup table for easier reference later.
    foreach ($navigationDisplayRules as $rule) {
      $rule = $rule['value'];
      $this->displayRules[$rule] = TRUE;
    };
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
    return $this->href;
  }

  /**
   * Retrieve raw megamenu html markup.
   *
   * The markup for megamenus are stored in content
   * blocks as URI encoded raw html. We need to
   * retrieve it and unencode the html.
   *
   * @return string
   *   Megamenu content block markup.
   */
  public function getMegamenuContent() {
    $megamenuFieldEntityReference = $this->term->field_mega_menu_content;
    $hasMegamenu = !$megamenuFieldEntityReference->isEmpty();
    if ($hasMegamenu) {
      $megamenuMarkupEncoded = $megamenuFieldEntityReference->entity->get('body')->value;
      $megamenuMarkupDecoded = Html::decodeEntities($megamenuMarkupEncoded);
      return $megamenuMarkupDecoded;
    }
    return "";
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
   * Get immediate descendent NavItems.
   *
   * Optional, pass an array of class properties
   * with boolean values to filter children against.
   *
   * @return \Drupal\cgov_core\NavItemInterface[]
   *   Filtered array of direct descendents.
   */
  public function getChildren() {
    // @var \Drupal\taxonomy\TermInterface[]
    $allChildTerms = $this->navMgr->getChildTerms($this->term);
    // Build the navItems to make interacting with terms easier.
    $navItems = array_map(function ($term) {
      return $this->navMgr->newNavItem($term);
    }, $allChildTerms);
    return $navItems;
  }

}
