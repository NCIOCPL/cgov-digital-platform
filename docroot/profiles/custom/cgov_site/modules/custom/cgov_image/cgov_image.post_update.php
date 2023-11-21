<?php

/**
 * @file
 * Contains cgov_image.post_update.
 */

/**
 * Add new D10 block content permissions.
 */
function cgov_image_post_update_d10_perms() {
  $tools = \Drupal::service('cgov_core.tools');
  foreach ([
    'cgov_image_carousel',
  ] as $block_type) {
    // Add content type permissions.
    $tools->addBlockContentTypePermissions($block_type, ['advanced_editor']);
  }
}
