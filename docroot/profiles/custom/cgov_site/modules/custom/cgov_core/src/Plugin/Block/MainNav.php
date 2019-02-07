<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_core\Services\CgovNavigationManagerInterface;
use Drupal\Core\Session\AccountInterface;
use Drupal\Core\Access\AccessResult;
use Drupal\cgov_core\NavItem;
use Drupal\cgov_core\Megamenu;

/**
 * Provides a 'Main Nav' block.
 *
 * @Block(
 *  id = "cgov_main_nav",
 *  admin_label = @Translation("Cgov Main Nav"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class MainNav extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManagerInterface
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
   * @param \Drupal\cgov_core\Services\CgovNavigationManagerInterface $navigationManager
   *   Cgov navigation service.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    CgovNavigationManagerInterface $navigationManager
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
    // TODO: Block access rules.
    return AccessResult::allowed();
  }

  /**
   * Get Main Nav NavItems.
   *
   * @return array
   *   Multidimensional main nav.
   */
  public function getMainNav() {
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
    $megaNavRootItems = $navRoot->getChildren(['hide_in_main_nav']);
    $renderedMegaNavTrees = [];
    for ($i = 0; $i < count($megaNavRootItems); $i++) {
      $rootItem = $megaNavRootItems[$i];
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
      $megamenu = $this->renderMegamenu($href);
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
   * Generate Megamenu markup.
   *
   * Retrieve raw html string from store based
   * on path.
   *
   * @param string $href
   *   Megamenu Parent.
   *
   * @return string
   *   Megamenu contents as markup string.
   */
  public function renderMegamenu(string $href) {
    $megamenuMarkup = Megamenu::$content[$href];
    return $megamenuMarkup;
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
    $maxDepth = 3;
    $isNotLastLevel = $maxDepth - $currentDepth > 0;
    $mobileItemsToRender = $rootItem->getChildren(['hide_in_mobile_nav']);
    $hasItemsToRender = count($mobileItemsToRender);
    if (!$hasItemsToRender) {
      return "";
    }
    $renderedMobileItems = [];
    for ($i = 0; $i < count($mobileItemsToRender); $i++) {
      $mobileItem = $mobileItemsToRender[$i];
      $href = $mobileItem->getHref();
      $label = $mobileItem->getLabel();
      $containsCurrent = $mobileItem->getIsInCurrentPath();
      $isCurrent = $mobileItem->isCurrentSiteSection();
      $currentStatusClassname = "";
      if ($containsCurrent) {
        $currentStatusClassname = "contains-current";
      }
      if ($isCurrent) {
        $currentStatusClassname = "current-page";
      }
      $children = "";
      if ($isNotLastLevel) {
        $children = $this->renderMobileNavLevel($mobileItem, $containsCurrent, $currentDepth + 1);
      }
      $markup = "
      <li class='lvl-$currentDepth $currentStatusClassname $isCurrent'>
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
   * {@inheritdoc}
   */
  public function build() {
    $navTree = $this->getMainNav();
    $build = [
      '#markup' => $navTree,
    ];

    return $build;
  }

}
