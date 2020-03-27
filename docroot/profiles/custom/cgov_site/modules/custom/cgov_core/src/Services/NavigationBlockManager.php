<?php

namespace Drupal\cgov_core\Services;

use Drupal\Core\Language\LanguageManagerInterface;
use Psr\Log\LoggerInterface;

use Drupal\cgov_core\NavItem;

/**
 * For working with navigation blocks.
 */
class NavigationBlockManager implements NavigationBlockManagerInterface {

  const MOBILE_NAV_MAX_DEPTH = 3;

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  private $navMgr;

  /**
   * Language manager, so we know what languages we're dealing with.
   *
   * @var Drupal\Core\Language\LanguageManagerInterface
   */
  private $languageManager;

  /**
   * Logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Mapping of block names to the methods which render them.
   *
   * Keys are the block names, and the values are the methods.
   *
   * @var string[]
   */
  private $blockMap = [
    'cgov_main_nav' => 'getCgovMainNav',
  ];

  /**
   * Constructs a new NavigationBlockManager instance.
   *
   * @param \Drupal\cgov_core\Services\CgovNavigationManager $navigationManager
   *   Cgov navigation service.
   * @param \Drupal\Core\Language\LanguageManagerInterface $languageManager
   *   Language manager instance so we know what language(s) we're working with.
   * @param \Psr\Log\LoggerInterface $logger
   *   Logger.
   */
  public function __construct(
    CgovNavigationManager $navigationManager,
    LanguageManagerInterface $languageManager,
    LoggerInterface $logger
  ) {
    $this->navMgr = $navigationManager;
    $this->languageManager = $languageManager;
    $this->logger = $logger;
  }

  /**
   * Draw a navigation block.
   *
   * @param string $block_name
   *   The name of the block to render.
   */
  public function getNavigationBlock(string $block_name) {

    if (\array_key_exists($block_name, $this->blockMap)) {
      $method = $this->blockMap[$block_name];
      return $this->$method();
    }
    else {
      $message = "Unknown block name '${block_name}.";
      $this->logger->error($message);
      throw new \UnexpectedValueException($message);
    }
  }

  /**
   * Draws the CancerGov Main navigation.
   *
   * @return string|void
   *   String containing the navigation HTML.
   */
  protected function getCgovMainNav() {

    $navRoot = $this->navMgr->getNavRoot('field_main_nav_root');
    if ($navRoot) {
      $renderTree = $this->renderMainNav($navRoot);
      return $renderTree;
    }
  }

  /**
   * Generate Main Navigation Markup.
   *
   * @param \Drupal\cgov_core\NavItem $navRoot
   *   Root NavItem.
   *
   * @return string
   *   Markup as string.
   */
  public function renderMainNav(NavItem $navRoot) {
    $megaNavRootItems = $navRoot->getChildren();
    $filteredMegaNavRootItems = [];
    foreach ($megaNavRootItems as $child) {
      if (!$child->hasDisplayRule('hide_in_main_nav')) {
        $filteredMegaNavRootItems[] = $child;
      }
    }
    usort($filteredMegaNavRootItems, [$this, "sortItemsByWeight"]);
    $renderedMegaNavTrees = [];
    for ($i = 0; $i < count($filteredMegaNavRootItems); $i++) {
      $rootItem = $filteredMegaNavRootItems[$i];
      $itemIndex = $i + 1;
      $href = $rootItem->getHref();
      $label = $rootItem->getLabel();
      $containsCurrent = $rootItem->getIsInCurrentPath();
      $isCurrent = $rootItem->isCurrentSiteSection();
      $currentStatusClassname = "";
      if ($containsCurrent) {
        $currentStatusClassname = "contains-current";
      }
      if ($isCurrent) {
        $currentStatusClassname = "current-page";
      }
      $children = $this->renderMobileNavLevel($rootItem, $containsCurrent, 2);
      $megamenu = $rootItem->getMegamenuContent();
      $hasChildrenClassname = strlen($children) > 0 ? 'has-children' : '';
      $markup = "
      <li class='nav-item lvl-1 $hasChildrenClassname $currentStatusClassname item-$itemIndex'>
        <div class='nav-item-title'>
          <a href='$href'>$label</a>
        </div>
        $children
        <div class='sub-nav-mega' aria-expanded='true' aria-haspopup='true'>
          $megamenu
        </div>
      </li>
      ";
      $renderedMegaNavTrees[] = $markup;
    }
    $megaNav = implode("", $renderedMegaNavTrees);
    return $megaNav;
  }

  /**
   * Generate Mobile navtree markup.
   *
   * @param \Drupal\cgov_core\NavItem $rootItem
   *   Root NavItem for mobile tree.
   * @param bool $isOpen
   *   Is this path expanded in the tree?
   * @param int $currentDepth
   *   Used to add class attributes and prevent
   *   excessively deep rendering.
   *
   * @return string
   *   Constructed markup as string.
   */
  public function renderMobileNavLevel(NavItem $rootItem, bool $isOpen, int $currentDepth) {
    $isNotLastLevel = self::MOBILE_NAV_MAX_DEPTH - $currentDepth > 0;
    $mobileItemsToRender = $rootItem->getChildren();
    $filteredMobileItemsToRender = [];
    foreach ($mobileItemsToRender as $child) {
      if (!$child->hasDisplayRule('hide_in_mobile_nav')) {
        $filteredMobileItemsToRender[] = $child;
      }
    }
    $hasItemsToRender = count($filteredMobileItemsToRender);
    if (!$hasItemsToRender) {
      return "";
    }
    usort($filteredMobileItemsToRender, [$this, "sortItemsByWeight"]);
    $renderedMobileItems = [];
    foreach ($filteredMobileItemsToRender as $mobileItem) {
      $href = $mobileItem->getHref();
      $label = $mobileItem->getLabel();
      $containsCurrent = $mobileItem->getIsInCurrentPath();
      $isCurrent = $mobileItem->isCurrentSiteSection();
      $currentStatusClassname = "";
      $hasChildrenClassname = "";
      if ($containsCurrent) {
        $currentStatusClassname = "contains-current";
      }
      if ($isCurrent) {
        $currentStatusClassname = "current-page";
      }
      $children = "";
      if ($isNotLastLevel) {
        $children = $this->renderMobileNavLevel($mobileItem, $containsCurrent, $currentDepth + 1);
        $hasChildrenClassname = strlen($children) > 0 ? 'has-children' : '';
      }
      $markup = "
      <li class='lvl-$currentDepth $currentStatusClassname $isCurrent $hasChildrenClassname'>
        <div class='nav-item-title'>
          <a href='$href'>$label</a>
        </div>
        $children
      </li>
      ";
      $renderedMobileItems[] = $markup;
    }
    $renderedMobileItemString = implode("", $renderedMobileItems);
    $markup = "
    <ul class='mobile-item'>
      $renderedMobileItemString
    </ul>
    ";
    return $markup;
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

}
