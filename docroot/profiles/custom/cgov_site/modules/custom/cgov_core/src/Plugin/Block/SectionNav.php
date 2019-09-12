<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\cgov_core\NavItem;

/**
 * Provides a 'Section Nav' block.
 *
 * @Block(
 *  id = "cgov_section_nav",
 *  admin_label = @Translation("Cgov Section Nav"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class SectionNav extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navMgr;

  /**
   * Constructs an LanguageBar object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\cgov_core\Services\CgovNavigationManager $navigationManager
   *   Cgov navigation service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    CgovNavigationManager $navigationManager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->navMgr = $navigationManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_core.cgov_navigation_manager')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function blockAccess(AccountInterface $account) {
    $shouldDisplay = $this->navMgr->getCurrentPathIsInNavigationTree();
    if ($shouldDisplay) {
      return AccessResult::allowed();
    }
    return AccessResult::forbidden();
  }

  /**
   * Get Section Nav NavItems.
   *
   * @return array
   *   Multidimensional section nav.
   */
  public function getSectionNav() {
    $navRoot = $this->navMgr->getNavRoot('field_section_nav_root');
    if ($navRoot) {
      // The fallback render depth should match the default set by the field
      // for levels to display on site section Terms.
      $renderDepth = $navRoot->getRenderDepth() ? intval($navRoot->getRenderDepth()) : 5;
      $renderTree = $this->renderNavElement($navRoot, $renderDepth);
      return $renderTree;
    }
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
  public function sortItemsByWeight(NavItem $firstItem, NavItem $secondItem) {
    $firstWeight = $firstItem->getWeight();
    $secondWeight = $secondItem->getWeight();
    if ($firstWeight === $secondWeight) {
      return 0;
    }
    return ($firstWeight < $secondWeight) ? -1 : 1;
  }

  /**
   * Create render tree of NavItems.
   *
   * @param \Drupal\cgov_core\NavItem $navItem
   *   Nav item.
   * @param int $renderDepth
   *   How many more levels to render in the tree.
   * @param int $currentLevel
   *   Used to generate level specific classnames.
   *
   * @return array
   *   Nav tree.
   */
  public function renderNavElement(NavItem $navItem, int $renderDepth, int $currentLevel = 0) {
    // Recursive base case.
    if (!$navItem || !$renderDepth) {
      return [];
    }
    // TODO: Consider building this as nested markup elements to completely
    // obviate the need for a template that simply parallels this logic.
    $isInCurrentPath = $navItem->getIsInCurrentPath();
    $isCurrentSectionLandingPage = $navItem->isCurrentSiteSectionLandingPage();
    $href = $navItem->getHref();
    $label = $navItem->getLabel();
    $childList = $navItem->getChildren();
    $childList = array_filter($childList, function ($child) {
      if ($child->hasDisplayRule('hide_in_section_nav')) {
        return FALSE;
      }
      return TRUE;
    });
    $hasChildren = count($childList) > 0;
    $children = [];
    if ($renderDepth > 1 && $hasChildren) {
      // Give the array a quick shuffle to respect term weights
      // of children before proceeding with recursive rendering.
      usort($childList, [$this, "sortItemsByWeight"]);
      $children = array_map(function ($child) use ($renderDepth, $currentLevel) {
        $currentLevel++;
        return $this->renderNavElement($child, $renderDepth - 1, $currentLevel);
      }, $childList);
    }
    $class = "";
    $class .= "level-$currentLevel";
    if ($hasChildren) {
      $class .= " has-children";
    }
    if ($isInCurrentPath) {
      $class .= " contains-current";
    }
    $isExpanded = $isInCurrentPath;
    $renderElement = [
      'href' => $href,
      'label' => $label,
      'class' => $class,
      'isExpanded' => $isExpanded,
      'isCurrentSectionLandingPage' => $isCurrentSectionLandingPage,
      'children' => $children,
    ];
    return $renderElement;
  }

  /**
   * {@inheritdoc}
   */
  public function build() {

    $build = [];

    $navTree = $this->getSectionNav();
    if ($navTree) {
      $build = [
        '#type' => 'block',
        '#nav_tree' => $navTree,
      ];

      // Set the cache tag if this if a nav root exists for this section.
      $navRoot = $this->navMgr->getNavRoot('field_section_nav_root');
      if ($navRoot) {
        $section_root_tid = $navRoot->getTerm()->id();
        $build['#cache'] = [
          'tags' => [
            'site_section:' . $section_root_tid,
          ],
        ];
      }
    }
    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    return 300;
  }

}
