<?php

namespace Drupal\cgov_site_section\Controller;

use Drupal\Core\Controller\ControllerBase;
use Drupal\taxonomy\TermInterface;
use Drupal\path_alias\AliasManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityTypeManager;
use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Cache\CacheableMetadata;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Controller routines for cgov_site_section routes.
 */
class CgovNavTreeController extends ControllerBase {

  /**
   * The path alias manager.
   *
   * @var \Drupal\path_alias\AliasManagerInterface
   */
  protected $aliasManager;

  /**
   * The Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  protected $entityTypeManager;

  /**
   * Constructs a new PathAliasListBuilder object.
   *
   * @param \Drupal\path_alias\AliasManagerInterface $alias_manager
   *   The path alias manager.
   * @param \Drupal\Core\Entity\EntityTypeManager $entityTypeManager
   *   The Entity Type Manager.
   */
  public function __construct(
    AliasManagerInterface $alias_manager,
    EntityTypeManager $entityTypeManager
  ) {
    $this->aliasManager = $alias_manager;
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('path_alias.manager'),
      $container->get('entity_type.manager'),
    );
  }

  /**
   * Return section nav items.
   */
  public function getSectionNav(TermInterface $taxonomy_term = NULL) {
    return $this->getNavData($taxonomy_term, 'section_nav', 'field_section_nav_root');
  }

  /**
   * Return mobile nav items.
   */
  public function getMobileNav(TermInterface $taxonomy_term = NULL) {
    return $this->getNavData($taxonomy_term, 'mobile_nav', 'field_main_nav_root');
  }

  /**
   * Return section nav items.
   */
  public function getNavData(TermInterface $taxonomy_term = NULL, $menu_type, $nav_field_name) {
    $nav_item = [];
    $hide_menu = 'hide_in_' . $menu_type;

    if ($menu_type == 'section_nav') {
      $length = $taxonomy_term->field_levels_to_display->value ?? 5;
    }
    if ($menu_type == 'mobile_nav') {
      $length = theme_get_setting('mobile_levels_to_display', 'cgov_common') ?? 4;
      // The root of the tree does not count in the levels to display.
      // So we are increasing the depth by 1 level.
      $length = $length + 1;
    }
    // Get the available navigation display options of the current term.
    $navigation_display_options = [];
    // Make sure the field has value.
    if ($taxonomy_term->get('field_navigation_display_options')->getValue()) {
      $display_options = $taxonomy_term->get('field_navigation_display_options')->getValue();
      $navigation_display_options = array_column($display_options, 'value');
    }

    // Get landing page path if the landing page is published.
    $path = NULL;
    // Make sure the term has field_landing_page value.
    if ($taxonomy_term->field_landing_page->target_id) {
      $landing_page_nid = $taxonomy_term->field_landing_page->target_id;

      // Load the landing page node.
      $landing_page_node = $this->entityTypeManager->getStorage('node')->load($landing_page_nid);
      if (isset($landing_page_node) && $landing_page_node->status->getString() == 1) {
        // Get landing page node path alias.
        $path = $this->aliasManager->getAliasByPath('/node/' . $landing_page_nid);
      }
    }

    // Return a 400 status code if the root Site Section's
    // field_main_nav_root field is false.
    // or field_landing_page is empty or unpublished.
    // Return a 400 status code ff the root section's
    // field_section_nav_root field is false.
    if ((!$taxonomy_term->{$nav_field_name}->value) || is_null($path)) {
      $response = new JsonResponse((object) $nav_item);
      $response->setStatusCode(400);
      return $response;
    }

    // Return empty response if hide_in_section_nav is enabled.
    if ((in_array($hide_menu, $navigation_display_options) && !$taxonomy_term->{$nav_field_name}->value)) {
      return new JsonResponse((object) $nav_item);
    }

    // Make the NavItem data for the parent term.
    $nav_item = [
      'id' => $taxonomy_term->id(),
      'langcode' => $taxonomy_term->langcode->value,
      'label' => $taxonomy_term->field_navigation_label->value ?? $taxonomy_term->getName(),
      'weight' => $taxonomy_term->weight->value,
      'path' => $path,
      'navigation_display_options' => $navigation_display_options,
      'is_section_nav_root' => (bool) $taxonomy_term->field_section_nav_root->value ?? FALSE,
      'is_main_nav_root' => (bool) $taxonomy_term->field_main_nav_root->value ?? FALSE,
    ];

    // Set site sections vocabulary name.
    $vocabulary = 'cgov_site_sections';
    $tree = [];
    // Load the taxonomy tree.
    $terms = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocabulary, $taxonomy_term->id());
    $tree = [];
    foreach ($terms as $tree_object) {
      $depth = 0;
      $this->buildTree($tree, $tree_object, $vocabulary, $depth, $length);
    }
    // Converts objects into arrays in the nested level.
    $children_data = json_decode(json_encode($tree), TRUE);

    // Validate the taxonomy tree based on the rules.
    $validated_children_data = $this->validatesTree($children_data, $hide_menu);

    // Retrieve the final list of items.
    $children_list = $this->arrayValuesRecursive($validated_children_data);

    // Append the children data to parent.
    $nav_item['children'] = array_values($children_list);

    // Return final JSON response.
    $cache_metadata = new CacheableMetadata();
    $cache_tag_id = 'nav_api_' . $menu_type . ':' . $taxonomy_term->id();
    $cache_metadata->addCacheTags([$cache_tag_id]);

    $response = new CacheableJsonResponse($nav_item);
    $response->addCacheableDependency($cache_metadata);

    return $response;
  }

  /**
   * Populates a tree array given a taxonomy term tree object.
   *
   * @param object $tree
   *   The taxonomy tree object.
   * @param object $object
   *   The object.
   * @param string $vocabulary
   *   The vocabulary name.
   * @param int $depth
   *   The depth.
   * @param int $length
   *   The levels.
   */
  protected function buildTree(&$tree, $object, $vocabulary, $depth, $length) {
    $depth++;
    if ($depth < $length) {
      $path = NULL;
      $object_data['tid'] = $object->tid;
      $object_data['depth'] = $object->depth;
      $object = (object) $object_data;

      // Get current taxonomy term.
      $current_term = $this->entityTypeManager->getStorage('taxonomy_term')->load($object->tid);
      // Make sure the term has field_landing_page value.
      if ($current_term->field_landing_page->target_id) {
        $landing_page_nid = $current_term->field_landing_page->target_id;
        // Load the landing page node.
        $landing_page_node = $this->entityTypeManager->getStorage('node')->load($landing_page_nid);
        if (isset($landing_page_node) && $landing_page_node->status->getString() == 1) {
          // Get landing page node path alias.
          $path = $this->aliasManager->getAliasByPath('/node/' . $landing_page_nid);
        }
      }

      // Get the available navigation display options of the current term.
      $navigation_display_options = [];
      // Make sure the field has value.
      if ($current_term->get('field_navigation_display_options')->getValue()) {
        $display_options = $current_term->get('field_navigation_display_options')->getValue();
        $navigation_display_options = array_column($display_options, 'value');
      }

      // Make the NavItem data for the child terms.
      // Set TID.
      $object->id = $current_term->id();
      // Set langcode.
      $object->langcode = $current_term->langcode->value;
      // Set label.
      $object->label = $current_term->field_navigation_label->value ?? $current_term->getName();
      // Set weight.
      $object->weight = $current_term->weight->value;
      // Set path.
      $object->path = $path;
      // Set navigation display options.
      $object->navigation_display_options = $navigation_display_options;
      // Set section nav root.
      $object->is_section_nav_root = (bool) $current_term->field_section_nav_root->value ?? FALSE;
      // Set main nav root.
      $object->is_main_nav_root = (bool) $current_term->field_main_nav_root->value ?? FALSE;
      if ($object->depth != 0) {
        return;
      }
      $tree[$object->tid] = $object;
      $tree[$object->tid]->children = [];
      $object_children = &$tree[$object->tid]->children;
      // Load taxonomy children.
      $children = $this->entityTypeManager->getStorage('taxonomy_term')->loadChildren($object->tid);
      if (!$children) {
        return;
      }

      // Load taxonomy child tree.
      $child_tree_objects = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vocabulary, $object->tid);

      // Loopthrough all children items and make hierarchical structure.
      foreach ($children as $child) {
        foreach ($child_tree_objects as $child_tree_object) {
          if ($child_tree_object->tid == $child->id()) {
            $this->buildTree($object_children, $child_tree_object, $vocabulary, $depth, $length);
          }
        }
      }
    }
  }

  /**
   * Validate the taxonomy tree based on the rules.
   *
   * @param array $children_data
   *   The taxonomy children data.
   * @param string $hide_menu
   *   The hide menu type.
   */
  public function validatesTree(array &$children_data, $hide_menu) {
    foreach ($children_data as $key => &$value) {
      if (is_array($value)) {
        // Exclude the terms if hide_in_section_nav is enabled.
        if (in_array($hide_menu, $value['navigation_display_options'])) {
          unset($children_data[$key]);
        }
        // Exclude the terms field_landing_page is empty.
        elseif (is_null($value['path'])) {
          unset($children_data[$key]);
        }
        elseif (!empty($value['children'])) {
          // Loopthrough the terms if the term has children.
          $this->validatesTree($value['children'], $hide_menu);
        }
      }
    }
    return $children_data;
  }

  /**
   * Retrieve the final list of items.
   *
   * @param array $validated_children_data
   *   The taxonomy children data.
   */
  public function arrayValuesRecursive(array $validated_children_data) {
    // Converts to indexed array for nested children terms.
    // Unset term depth and tid.
    unset($validated_children_data['depth']);
    unset($validated_children_data['tid']);
    foreach ($validated_children_data as $key => $value) {
      if (is_array($value)) {
        $validated_children_data[$key] = $this->arrayValuesRecursive($value);
      }
    }
    // Converts to indexed array for current child term.
    if (isset($validated_children_data['children'])) {
      $validated_children_data['children'] = array_values($validated_children_data['children']);
    }

    return $validated_children_data;
  }

}
