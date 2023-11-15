<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\cgov_core\Services\CgovNavigationManager;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Url;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'NCIDS Sidenav' block.
 *
 * @Block(
 *  id = "ncids_sidenav",
 *  admin_label = @Translation("NCIDS Sidenav"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class NcidsSidenav extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Cgov Navigation Manager Service.
   *
   * @var \Drupal\cgov_core\Services\CgovNavigationManager
   */
  protected $navMgr;

  /**
   * Constructs an NCIDS Header object.
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
   * Helper function to add current/ancestor state to nav based on current url.
   *
   * This modifies the tree in place.
   *
   * @param array $treeNode
   *   The nav tree.
   * @param string $currentPath
   *   The current url/path.
   */
  private function setActivePaths(array &$treeNode, $currentPath) {

    if ($this->navMgr->isTermIdInActivePath($treeNode['id'])) {
      if ($treeNode['href'] === $currentPath) {
        // On our site we have some weird navigation use cases for the
        // CTHP sections. In these cases, one of the children of this
        // node will have the same URL. In these cases the child should
        // be the current state. Technical the URL can show up multiple
        // places in the tree, but we are not going to go crazy looking
        // all over for the deepest page.
        for ($i = 0; $i < count($treeNode['children']); $i++) {
          if ($treeNode['children'][$i]['href'] === $currentPath) {
            // Set the current node as an ancestor.
            $treeNode['navstate'] = 'ancestor';
            // Set the child as the current.
            $treeNode['children'][$i]['navstate'] = 'current';
            // Stop processing as we are not going to find anything
            // active deeper.
            return;
          }
        }

        // We must not have a child with the same URL, so we need to
        // mark this page as the current one.
        $treeNode['navstate'] = 'current';
      }
      else {
        $treeNode['navstate'] = 'ancestor';
        // Handle Children.
        for ($i = 0; $i < count($treeNode['children']); $i++) {
          $this->setActivePaths($treeNode['children'][$i], $currentPath);
        }

      }
    }
  }

  /**
   * Helper function to get a nested nav tree for the side nav.
   *
   * @todo This should be moved out of here and we should cache the results of
   * the tree. Since this tree will be shared across many pages we should get a
   * bit of a performance boost from not having to fetch from the DB and then
   * filter out the nodes that should not show. This should then be cached
   * using the cache navItem cache tags. Once we implement this we can also
   * update the section-nav API endpoint to use the same data.
   *
   * @return mixed
   *   The navtree if it exists.
   */
  private function getTreeForSideNav() {
    // Get the root of the tree.
    $navRoot = $this->navMgr->getNavRoot('field_section_nav_root');

    if ($navRoot && $navRoot->isNavigable()) {
      // Setup the max depth for this nav. The root node is counted as the first
      // level.
      $renderDepth = $navRoot->getRenderDepth() ? intval($navRoot->getRenderDepth()) : 5;

      $tree = $navRoot->getAsNavTree($renderDepth, 'hide_in_section_nav');

      if ($tree) {
        $currentUrl = Url::fromRoute('<current>');
        $this->setActivePaths($tree, $currentUrl->toString());
        return $tree;
      }
    }

    return [];
  }

  /* @todo Determine if we should implement blockAccess */

  /**
   * {@inheritdoc}
   */
  public function build() {
    // @todo consider making a ncids_side_nav #theme hook or something so that
    // we can return a render array.
    $navTree = $this->getTreeForSideNav();
    $build = [
      '#type' => 'block',
      '#nav_tree' => $navTree,
    ];
    return $build;
  }

  /* --------------------------------------------------------------------------
   * The caching for a section nav is tricky. The rendered markup changes for
   * each page. So the block itself does not make sense to be cached.
   * However, we must send cache tags to the various caching services
   * (Varnish/Akamai) to tell them which nav is on the pages so that the pages
   * can be cleared when the nav updates.
   *
   * @todo We need to implement caching for the actual menu tree.
   * The rendering of the markup showing what is current/open has to be done
   * on each page, but this is not that expensive. Getting the nav in the first
   * place is expensive though.
   * --------------------------------------------------------------------------
   */

  /**
   * {@inheritdoc}
   */
  public function getCacheMaxAge() {
    // This is actually not the best way to handle this. We need to tell Drupal
    // not to cache this block, cause it changes on every page and would junk up
    // the cache backend.
    // Unfortunately, setting this to 0 does not allow the page to be cached by
    // the dynamic page cache.
    // This should be resolved someday as part of
    // https://www.drupal.org/project/drupal/issues/2888838, which
    // differentiates between this "thing" should not be cached and this
    // "thing" is not worth caching, but go ahead an cache the page in the
    // dynamic page cache.
    return 0;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheTags() {
    // The navigation contents of this side nav is actually shared across
    // pages. When any page within that nav is updated, all pages displaying
    // that nav must be cleared out. So this method adds the id of the
    // site section that is the root of the nav as a cache tag. There are
    // functions in cgov_site_sections.module to clear out these navs when
    // certain elements change on the site sections.
    $tags = [];

    // Get the nav root for the current URL. This should return null if there
    // is no section nav for this page.
    $navRoot = $this->navMgr->getNavRoot('field_section_nav_root');
    if ($navRoot && $navRoot->isNavigable()) {
      $section_root_tid = $navRoot->getTerm()->id();
      $tags[] = 'site_section:' . $section_root_tid;
    }

    return Cache::mergeTags(parent::getCacheTags(), $tags);
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts() {
    // We need to tell Drupal that this block changes for every page.
    return Cache::mergeContexts(parent::getCacheContexts(), ['url.path']);
  }

}
