<?php

/**
 * @file
 * Contains cgov_image.post_update.
 */

use Drupal\cgov_core\CgovCoreTools;

/**
 * Remove cgov_image_carousel bundle references from block_content field map.
 */
function cgov_image_post_update_purge_image_carousel_field_map(&$sandbox) {
  CgovCoreTools::purgeBundleFromFieldMap('block_content', 'cgov_image_carousel');
  return 'Purged cgov_image_carousel from the block_content bundle field map.';
}
