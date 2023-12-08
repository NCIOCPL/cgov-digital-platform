<?php

/**
 * @file
 * Contains cgov_site_section.post_update.
 */

/**
 * Add new D10 block content permissions.
 */
function cgov_site_section_post_update_d10_perms() {
  $tools = \Drupal::service('cgov_core.tools');
  foreach ([
    'ncids_mega_menu_content',
  ] as $block_type) {
    // Add content type permissions.
    $tools->addBlockContentTypePermissions($block_type, ['advanced_editor']);
  }
}
