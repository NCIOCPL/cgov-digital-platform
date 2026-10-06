<?php

/**
 * @file
 * Contains cgov_video.post_update.
 */

use Drupal\cgov_core\CgovCoreTools;

/**
 * Remove cgov_video_carousel bundle references from block_content field map.
 */
function cgov_video_post_update_purge_video_carousel_field_map(&$sandbox) {
  CgovCoreTools::purgeBundleFromFieldMap('block_content', 'cgov_video_carousel');
  return 'Purged cgov_video_carousel from the block_content bundle field map.';
}
