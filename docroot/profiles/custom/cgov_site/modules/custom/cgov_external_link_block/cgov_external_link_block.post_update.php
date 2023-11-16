<?php

/**
 * @file
 * Contains cgov_external_link_block.post_update.
 */

/**
 * Add new D10 block content permissions.
 */
function cgov_external_link_block_post_update_d10_perms() {
  $tools = \Drupal::service('cgov_core.tools');
  foreach ([
    'cgov_external_link_block',
  ] as $block_type) {
    // Add content type permissions.
    $tools->addBlockContentTypePermissions($block_type, ['advanced_editor']);
  }
}
