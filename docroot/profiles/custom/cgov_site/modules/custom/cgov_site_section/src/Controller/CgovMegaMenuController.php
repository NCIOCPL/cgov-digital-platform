<?php

namespace Drupal\cgov_site_section\Controller;

use Drupal\Core\Cache\CacheableJsonResponse;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Entity\EntityTypeManager;
use Drupal\path_alias\AliasManagerInterface;
use Drupal\taxonomy\TermInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;

/**
 * Controller routines for cgov_site_section routes.
 */
class CgovMegaMenuController extends ControllerBase {

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
    EntityTypeManager $entityTypeManager,
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
  public function getMegaMenu(?TermInterface $taxonomy_term = NULL) {
    $field_yaml_content = [];
    // Make sure the field_ncids_mega_menu_contents is not empty.
    if ($taxonomy_term->get('field_ncids_mega_menu_contents')->target_id) {
      $field_ncids_mega_menu_block_id = $taxonomy_term->get('field_ncids_mega_menu_contents')->target_id;
      $field_ncids_mega_menu_block = $this->entityTypeManager->getStorage('block_content')->load($field_ncids_mega_menu_block_id);

      // Make sure the field_ncids_mega_menu_block is published.
      if (!empty($field_ncids_mega_menu_block) &&  $field_ncids_mega_menu_block->status->value == 1) {
        $field_yaml_content = $field_ncids_mega_menu_block->field_yaml_content->value;

        // Return final JSON response.
        $cache_metadata = new CacheableMetadata();
        $mega_menu_section_cache_tag_id = 'mega-menu-section:' . $taxonomy_term->id();
        $mega_menu_block_cache_tag_id = 'mega-menu-block:' . $field_ncids_mega_menu_block_id;
        $cache_metadata->addCacheTags(
          [
            $mega_menu_section_cache_tag_id,
            $mega_menu_block_cache_tag_id,
          ]
        );

        $response = new CacheableJsonResponse($field_yaml_content);
        $response->addCacheableDependency($cache_metadata);
        return $response;
      }
    }
    // Return 404 status code.
    $response = new JsonResponse((object) $field_yaml_content);
    $response->setStatusCode(404);
    return $response;
  }

}
