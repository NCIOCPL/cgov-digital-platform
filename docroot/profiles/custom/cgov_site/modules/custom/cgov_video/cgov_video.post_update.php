<?php

/**
 * @file
 * Contains cgov_video.post_update.
 */

/**
 * Add new D10 block content permissions.
 */
function cgov_video_post_update_d10_perms() {
  $tools = \Drupal::service('cgov_core.tools');
  foreach ([
    'cgov_video_carousel',
  ] as $block_type) {
    // Add content type permissions.
    $tools->addBlockContentTypePermissions($block_type, ['advanced_editor']);
  }
}
