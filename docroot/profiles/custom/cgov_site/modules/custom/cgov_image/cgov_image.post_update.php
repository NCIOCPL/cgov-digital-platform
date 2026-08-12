<?php

/**
 * @file
 * Contains cgov_image.post_update.
 */

use Drupal\cgov_core\CgovCoreTools;

/**
 * Removes permissions, content, and configuration for cgov_image_carousel.
 */
function cgov_image_post_update_remove_image_carousel_entirely(): void {
  $block_type = 'cgov_image_carousel';
  $roles = ['advanced_editor'];
  $entity_type_manager = \Drupal::entityTypeManager();

  // ==========================================
  // PART 1: Revoke Permissions
  // ==========================================
  $perms = CgovCoreTools::BLOCK_CONTENT_PERMISSIONS;
  $permissions_to_revoke = [];

  foreach ($perms as $perm) {
    if (str_contains($perm, '[content_type]')) {
      $permissions_to_revoke[] = str_replace('[content_type]', $block_type, $perm);
    }
  }

  if (!empty($permissions_to_revoke)) {
    foreach ($roles as $role_id) {
      user_role_revoke_permissions($role_id, $permissions_to_revoke);
    }
  }

  // ==========================================
  // PART 2: Delete Content Instances
  // ==========================================
  $block_storage = $entity_type_manager->getStorage('block_content');
  $block_ids = $block_storage->getQuery()
    ->accessCheck(FALSE)
    ->condition('type', $block_type)
    ->execute();

  if (!empty($block_ids)) {
    $blocks = $block_storage->loadMultiple($block_ids);
    $block_storage->delete($blocks);
  }

  // ==========================================
  // PART 3: Delete the Entity Browser Config
  // ==========================================
  // Remove the entity browser configuration explicitly before the block type.
  $browser_storage = $entity_type_manager->getStorage('entity_browser');
  $browser_entity = $browser_storage->load('cgov_image_carousel_image_browser');

  if ($browser_entity) {
    $browser_entity->delete();
  }

  // ==========================================
  // PART 4: Delete the Block Type Configuration
  // ==========================================
  $type_storage = $entity_type_manager->getStorage('block_content_type');
  $bundle_entity = $type_storage->load($block_type);

  if ($bundle_entity) {
    $bundle_entity->delete();
  }
}
