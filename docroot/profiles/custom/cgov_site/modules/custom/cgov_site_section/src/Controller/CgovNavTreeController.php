<?php

namespace Drupal\cgov_site_section\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\taxonomy\TermInterface;
use Drupal\Core\Render\RendererInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Cache\CacheableMetadata;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Controller routines for cgov_site_section routes.
 */
class CgovNavTreeController extends ControllerBase {

  /**
   * The renderer service.
   *
   * @var \Drupal\Core\Render\RendererInterface
   */
  protected $renderer;

  /**
   * Constructs a new PathAliasListBuilder object.
   *
   * @param \Drupal\Core\Render\RendererInterface $renderer
   *   The renderer.
   */
  public function __construct(
    RendererInterface $renderer
  ) {
    $this->renderer = $renderer;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('renderer'),
    );
  }

  /**
   * Return section nav items.
   */
  public function getSectionNav(TermInterface $taxonomy_term = NULL) {
    $menu_type = 'section_nav';

    // If this is not a section nav root we need to return a 400.
    // We do this check here to avoid any more data fetches for an error.
    if (!$taxonomy_term->field_section_nav_root->value) {
      return $this->getEmpty400Response();
    }

    // Fetch the tree.
    $depth = $taxonomy_term->field_levels_to_display->value ?? 5;
    $tree_root = $this->getNavData($taxonomy_term, $menu_type, $depth);

    if ($tree_root !== NULL) {
      // So that all went well. Let's get the parent section.
      $parent_info = $this->getParentNavInfo($taxonomy_term);
      $data = ['nav' => $tree_root, 'parent_info' => $parent_info];
      return $this->getValidResponse($data, $menu_type, $tree_root['id']);
    }
    else {
      return $this->getEmpty400Response();
    }
  }

  /**
   * Return mobile nav items.
   */
  public function getMobileNav(TermInterface $taxonomy_term = NULL) {
    $menu_type = 'mobile_nav';

    // If this is not a main nav root we need to return a 400.
    // We do this check here to avoid any more data fetches for an error.
    if (!$taxonomy_term->field_main_nav_root->value) {
      return $this->getEmpty400Response();
    }

    // The root of the tree does not count in the levels to display.
    // So we are increasing the depth by 1 level.
    $depth = (theme_get_setting('mobile_levels_to_display', 'cgov_common') ?? 4) + 1;
    $tree_root = $this->getNavData($taxonomy_term, $menu_type, $depth);

    if ($tree_root !== NULL) {
      $data = ['nav' => $tree_root, 'parent_info' => []];
      return $this->getValidResponse($data, $menu_type, $tree_root['id']);
    }
    else {
      return $this->getEmpty400Response();
    }
  }

  /**
   * Gets an empty 400 response for error conditions.
   *
   * @return \Component\HttpFoundation\JsonResponse
   *   An empty JSON Object with a 400 status.
   */
  protected function getEmpty400Response() {
    $response = new JsonResponse((object) []);
    $response->setStatusCode(400);
    return $response;
  }

  /**
   * Gets a valid response with tree data.
   *
   * @param array $tree_root
   *   The root of the navigation tree.
   * @param string $menu_type
   *   Type of the menu being retrieved. This is `section_nav` or `mobile_nav`.
   * @param string|int $menu_id
   *   The ID of the root menu.
   *
   * @return \Component\HttpFoundation\JsonResponse
   *   A JSON Object with a 200 status and tree data.
   */
  protected function getValidResponse(array $tree_root, $menu_type, $menu_id) {
    // Renderer.
    // Return final JSON response.
    $cache_metadata = new CacheableMetadata();
    $cache_tag_id = 'nav_api_' . $menu_type . ':' . $menu_id;
    $cache_metadata->addCacheTags([$cache_tag_id]);
    // NOTE: Every term is accessible via both the English and Spanish routes.
    // The difference is that generating the path for the landing page URL will
    // take into account the language and generates the path accordingly. So we
    // must vary the cache based on language.
    $cache_metadata->addCacheContexts(['languages:language_interface']);

    $response = new CacheableJsonResponse($tree_root);
    $response->addCacheableDependency($cache_metadata);

    return $response;
  }

  /**
   * Gets the landing page alias for a given site section.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   The taxonomy term to get the URL for.
   *
   * @return string|null
   *   The alias for the home page.
   */
  protected function getLandingPagePath(TermInterface $term) {
    $path = NULL;

    // Note: this just loads the entity in the default language.
    /** @var \Drupal\node\NodeInterface */
    $landing_page = $term->field_landing_page->entity;

    if ($landing_page) {
      $langcode = $this->languageManager()->getCurrentLanguage()->getId();
      $landing_page = $landing_page->hasTranslation($langcode) ?
        $landing_page->getTranslation($langcode) :
        $landing_page;

      if ($landing_page->access('view', NULL, TRUE)->isAllowed()) {
        // Get landing page node path alias.
        // This way is a workaround so that cache metadata does not
        // bubble up. We don't actually want to include the landing
        // pages in the cache tags as we have a different way of
        // handling clearing those out.
        $path = $landing_page->toUrl()->toString(TRUE)->getGeneratedUrl();
      }
    }

    return $path;
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
   * Gets the parent navigation section info.
   *
   * @param \Drupal\taxonomy\TermInterface $term
   *   The term to get the parent information for.
   *
   * @return array
   *   The id and type of the parent nav, and the closest term that would
   *   display.
   */
  protected function getParentNavInfo(TermInterface $term) {
    // This gets the parent navigation branch where this term would appear.
    $pruned_parent_branch = $this->getNextBranch($term);

    // There is no parent navigation.
    // This is probably not what one would expect if calling this.
    if (count($pruned_parent_branch) === 0) {
      return [];
    }

    $parentNav = [
      'id' => $pruned_parent_branch[0]->id(),
      // So we prefer main nav over section, and if we have a node then it must
      // be one of the two. So the ternary works here.
      'menu_type' => $pruned_parent_branch[0]->field_main_nav_root->value ? 'mobile-nav' : 'section-nav',
    ];

    $closest_node = $pruned_parent_branch[array_key_last($pruned_parent_branch) ?? 0];

    // Ok, we want to give back navigation information about the root's parent
    // The problem is that the closest node can be the nav tree root ($term),
    // or it can be some other ancestor of $term. If it is the root, then we
    // need to fetch the next to last one in the array.
    // ------------------------------------------------------------------------
    // We can assume that if the $term is the LAST item in $pruned_parent_branch
    // (i.e. $closest_node) then there is at least 1 more element in the
    // $pruned_parent_branch array. This is because it is impossible for the
    // $term to be at index 0, otherwise there is no parent menu. If
    // $closest_node is not $term, that it WILL be the parent link.
    $parent_link_node = $closest_node !== $term ? $closest_node : $pruned_parent_branch[count($pruned_parent_branch) - 2];

    $display_options = $this->getNavigationDisplayOptions($parent_link_node);
    $path = $this->getLandingPagePath($parent_link_node);
    // 4. Make the nav item.
    $parent_link_nav_item = [
      'id' => $parent_link_node->id(),
      'langcode' => $parent_link_node->langcode->value,
      'label' => $parent_link_node->field_navigation_label->value ?? $parent_link_node->getName(),
      'weight' => $parent_link_node->weight->value,
      'path' => $path,
      'navigation_display_options' => $display_options,
      'is_section_nav_root' => (bool) $parent_link_node->field_section_nav_root->value ?? FALSE,
      'is_main_nav_root' => (bool) $parent_link_node->field_main_nav_root->value ?? FALSE,
      'children' => [],
    ];

    $parent_info = [
      'parent_nav' => $parentNav,
      'parent_link_item' => $parent_link_nav_item,
      'closest_id_in_parent' => $closest_node->id(),
    ];

    return $parent_info;
  }

  /**
   * Return section nav items.
   *
   * @param \Drupal\taxonomy\TermInterface $taxonomy_term
   *   The term to retrieve the nav data for.
   * @param string $menu_type
   *   Type of the menu being retrieved. This is `section_nav` or `mobile_nav`.
   * @param int $max_depth
   *   The number of levels to show in the tree.
   *
   * @return array
   *   The navigation root.
   */
  protected function getNavData(TermInterface $taxonomy_term = NULL, $menu_type, $max_depth) {
    $nav_item = [];

    // Get landing page path if the landing page is published.
    $path = $this->getLandingPagePath($taxonomy_term);

    // Return a 400 status code if the root Site Section's field_landing_page
    // is empty or unpublished.
    if (is_null($path)) {
      return NULL;
    }

    // If the depth is 1, then we are just showing the root level.
    // Section navs do this a lot.
    $children = 1 < $max_depth ? $this->getChildren($taxonomy_term, $menu_type, $max_depth, 2) : [];

    // Make the NavItem data for the parent term.
    $nav_item = [
      'id' => $taxonomy_term->id(),
      'langcode' => $taxonomy_term->langcode->value,
      'label' => $taxonomy_term->field_navigation_label->value ?? $taxonomy_term->getName(),
      'weight' => $taxonomy_term->weight->value,
      'path' => $path,
      'navigation_display_options' => $this->getNavigationDisplayOptions($taxonomy_term),
      'is_section_nav_root' => (bool) $taxonomy_term->field_section_nav_root->value ?? FALSE,
      'is_main_nav_root' => (bool) $taxonomy_term->field_main_nav_root->value ?? FALSE,
      'children' => $children,
    ];

    return $nav_item;
  }

  /**
   * Gets the child navigation tree nodes.
   *
   * NOTE: This will recurse.
   *
   * @param \Drupal\taxonomy\TermInterface $parent_term
   *   The term to fetch the children for.
   * @param string $menu_type
   *   Type of the menu being retrieved. This is `section_nav` or `mobile_nav`.
   * @param int $max_depth
   *   The number of levels to show in the tree.
   * @param int $curr_level
   *   The current level of the tree we are working on.
   *
   * @return array
   *   An array of child navigation items.
   */
  protected function getChildren(TermInterface $parent_term, $menu_type, $max_depth, $curr_level) {
    $hide_menu = 'hide_in_' . $menu_type;
    /** @var \Drupal\taxonomy\TermStorageInterface */
    $term_storage = $this->entityTypeManager()->getStorage('taxonomy_term');
    $children = $term_storage->loadChildren($parent_term->id());
    // We want a simple list instead of id keyed assoc array.
    $filtered_children = [];
    foreach ($children as $child_term) {

      // 1. Check to make sure it is not hidden in the $menu_type.
      $display_options = $this->getNavigationDisplayOptions($child_term);
      if (in_array($hide_menu, $display_options)) {
        continue;
      }

      // 2. Check to make sure it has a valid path.
      $path = $this->getLandingPagePath($child_term);
      if ($path === NULL) {
        continue;
      }

      // 3. Fetch the children of this child.
      $children = $curr_level < $max_depth ? $this->getChildren($child_term, $menu_type, $max_depth, $curr_level + 1) : [];

      // 4. Make the nav item.
      $nav_item = [
        'id' => $child_term->id(),
        'langcode' => $child_term->langcode->value,
        'label' => $child_term->field_navigation_label->value ?? $child_term->getName(),
        'weight' => $child_term->weight->value,
        'path' => $path,
        'navigation_display_options' => $display_options,
        'is_section_nav_root' => (bool) $child_term->field_section_nav_root->value ?? FALSE,
        'is_main_nav_root' => (bool) $child_term->field_main_nav_root->value ?? FALSE,
        'children' => $children,
      ];

      $filtered_children[] = $nav_item;
    }

    return $filtered_children;
  }

  /**
   * Return the branch of the next nav that this term would appear in.
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
  public function getNextBranch(TermInterface $term) {
    /** @var \Drupal\taxonomy\TermInterface[] */
    $ancestry = [$term];
    /** @var \Drupal\taxonomy\TermInterface */
    $parent_term = $this->getParentTerm($term);
    while ($parent_term !== NULL) {
      $ancestry[] = $parent_term;
      $isNavRoot = ($parent_term->field_main_nav_root->value || $parent_term->field_section_nav_root->value);
      // If we found the next nav root, then stop fetching.
      $parent_term = $isNavRoot ? NULL : $this->getParentTerm($parent_term);
    }

    // Now reverse the array, so it is root, followed by the first child, etc.
    $branch = array_reverse($ancestry);

    if (
      $branch[0] === $term ||
      !($branch[0]->field_main_nav_root->value || $branch[0]->field_section_nav_root->value)
    ) {
      // Basically, there is no other term in the ancestry that is the root.
      return [];
    }

    $pruned_branch = [];

    // No term *should* be a main nav root and a section nav root. When they
    // are, the mobile nav takes precedence.
    if ($branch[0]->field_main_nav_root->value) {
      $max_depth = (theme_get_setting('mobile_levels_to_display', 'cgov_common') ?? 4) + 1;
      $pruned_branch = $this->pruneBranch($branch, 'mobile_nav', $max_depth);
    }
    elseif ($branch[0]->field_section_nav_root->value) {
      $max_depth = $branch[0]->field_levels_to_display->value ?? 5;
      $pruned_branch = $this->pruneBranch($branch, 'section_nav', $max_depth);
    }

    return $pruned_branch;
  }

  /**
   * Prunes a nav branch for based on our filter rules.
   *
   * @param \Drupal\taxonomy\TermInterface[] $branch
   *   The branch to prune.
   * @param string $menu_type
   *   Type of the menu being retrieved. This is `section_nav` or `mobile_nav`.
   * @param int $max_depth
   *   The number of levels to show in the tree.
   *
   * @return \Drupal\taxonomy\TermInterface[]
   *   The pruned branch.
   */
  protected function pruneBranch(array $branch, $menu_type, $max_depth) {
    $hide_menu = 'hide_in_' . $menu_type;
    $pruned_branch = [$branch[0]];

    // The for loop is ugly because we want to stop if:
    // 1. There are no more elements in the array.
    // 2. We have not gone past the max depth for the nav.
    for ($idx = 1; $idx < count($branch) && $idx + 1 < $max_depth; $idx++) {
      $curr_term = $branch[$idx];

      // 1. Check to make sure it is not hidden in the $menu_type.
      $display_options = $this->getNavigationDisplayOptions($curr_term);
      if (in_array($hide_menu, $display_options)) {
        break;
      }

      // 2. Check to make sure it has a valid path.
      $path = $this->getLandingPagePath($curr_term);
      if ($path === NULL) {
        break;
      }

      // This would show push it onto the pruned branch.
      $pruned_branch[] = $curr_term;
    }

    return $pruned_branch;
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
    /** @var \Drupal\taxonomy\TermStorageInterface */
    $term_storage = $this->entityTypeManager()->getStorage('taxonomy_term');
    /** @var \Drupal\Core\Entity\EntityInterface[] */
    $parents = $term_storage->loadParents($term->id());
    // Load parents return an associative array where key is $tid
    // obviating the need to query the term itself for its id.
    if (count(array_keys($parents))) {
      /** @var \Drupal\taxonomy\TermInterface */
      return $parents[array_keys($parents)[0]];
    }
  }

}
