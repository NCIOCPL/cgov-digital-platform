<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\cgov_core\NavItem;

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

  const MOBILE_NAV_MAX_DEPTH = 3;

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navMgr;

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

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
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    CgovNavigationManager $navigationManager,
    LanguageManagerInterface $language_manager
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->navMgr = $navigationManager;
    $this->languageManager = $language_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_core.cgov_navigation_manager'),
      $container->get('language_manager')
    );
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

  /**
   * Get Main Nav NavItems.
   *
   * @return array
   *   Multidimensional main nav.
   */
  public static function getMainNav() {
    $navMgr = \Drupal::Service('cgov_core.cgov_navigation_manager');
    $navRoot = $navMgr->getNavRoot('field_main_nav_root');
    if ($navRoot) {
      $renderTree = self::renderMainNav($navRoot);
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
  public static function renderMainNav(NavItem $navRoot) {
    $megaNavRootItems = $navRoot->getChildren();
    $filteredMegaNavRootItems = [];
    foreach ($megaNavRootItems as $child) {
      if (!$child->hasDisplayRule('hide_in_main_nav')) {
        $filteredMegaNavRootItems[] = $child;
      }
    }
    usort($filteredMegaNavRootItems, ['self', "sortItemsByWeight"]);
    $renderedMegaNavTrees = [];
    // Iterate over the top level of navigation items that would appear in the
    // Main Menu on the desktop site.
    for ($i = 0; $i < count($filteredMegaNavRootItems); $i++) {
      $rootItem = $filteredMegaNavRootItems[$i];
      $itemIndex = $i + 1;
      $href = $rootItem->getHref();
      $label = $rootItem->getLabel();

      // Get the child HTML elements for this items Mobile menu.
      $children = self::renderMobileNavLevel($rootItem, 2);

      // Get the Megamenu contents if they have been set.
      $megamenu = $rootItem->getMegamenuContent();
      $hasChildrenClassname = strlen($children) > 0 ? 'has-children' : '';
      $markup = "
      <li class='nav-item lvl-1 $hasChildrenClassname item-$itemIndex'>
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
   * @param int $currentDepth
   *   Used to add class attributes and prevent
   *   excessively deep rendering.
   *
   * @return string
   *   Constructed markup as string.
   */
  public static function renderMobileNavLevel(NavItem $rootItem, int $currentDepth) {
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
    usort($filteredMobileItemsToRender, ['self', "sortItemsByWeight"]);
    $renderedMobileItems = [];
    foreach ($filteredMobileItemsToRender as $mobileItem) {
      $href = $mobileItem->getHref();
      $label = $mobileItem->getLabel();
      $hasChildrenClassname = "";
      $children = "";
      if ($isNotLastLevel) {
        $children = self::renderMobileNavLevel($mobileItem, $currentDepth + 1);
        $hasChildrenClassname = strlen($children) > 0 ? 'has-children' : '';
      }
      $markup = "
      <li class='lvl-$currentDepth $hasChildrenClassname'>
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
    // Get the current language, as that is our cache tag.
    $langcode = $this->languageManager->getCurrentLanguage()->getId();
    $build = [
      // TODO: Change from markup to an actual object/theme.
      '#type' => 'markup',
      '#pre_render' => [
        static::class . '::preRender',
      ],
      '#cache' => [
        // This should vary on the interface so that 404 and other
        // non-entity pages have the proper menu.
        'contexts' => ['languages:language_interface'],
        'tags' => ['mainnav:' . $langcode, 'mainnav_manual'],
        'max-age' => Cache::PERMANENT,
      ],
    ];
    return $build;
  }

  /**
   * The #pre_render callback for building a block.
   *
   * Renders the content using the provided block plugin, and then:
   * - if there is no content, aborts rendering, and makes sure the block won't
   *   be rendered.
   * - if there is content, moves the contextual links from the block content to
   *   the block itself.
   */
  public static function preRender($build) {
    // We are not cached and should render.
    $navTree = self::getMainNav();

    // TODO: Change from markup to an actual object/theme.
    $build['#markup'] = $navTree;

    return $build;
  }

}
