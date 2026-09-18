<?php

/**
 * @file
 * Contains cgov_video.post_update.
 */

/**
 * Remove cgov_video_carousel bundle references from block_content field map.
 */
function cgov_video_post_update_purge_video_carousel_field_map(&$sandbox) {
  $key_value = \Drupal::keyValue('entity.definitions.bundle_field_map');
  $map = $key_value->get('block_content');

  if (is_array($map)) {
    $changed = FALSE;

    // Loop through all fields attached to block_content.
    foreach ($map as $field_name => &$field_info) {
      if (isset($field_info['bundles']['cgov_video_carousel'])) {
        // Unset the zombie bundle.
        unset($field_info['bundles']['cgov_video_carousel']);
        $changed = TRUE;
      }

      // If the field is no longer attached to ANY bundles, remove it entirely.
      if (empty($field_info['bundles'])) {
        unset($map[$field_name]);
        $changed = TRUE;
      }
    }

    // Save the scrubbed map back to the database.
    if ($changed) {
      $key_value->set('block_content', $map);
    }
  }

  // Clear the cached field definitions so Views and the UI pick up the fix.
  \Drupal::service('entity_field.manager')->clearCachedFieldDefinitions();

  return 'Purged cgov_video_carousel from the block_content bundle field map.';
}
