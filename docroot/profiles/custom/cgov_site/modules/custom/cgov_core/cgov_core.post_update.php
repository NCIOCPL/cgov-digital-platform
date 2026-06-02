<?php

/**
 * @file
 * Post update functions for Cgov Core.
 */

/**
 * Enable new theme: stable9.
 */
function cgov_core_post_update_install_stable9() {
  // Remove classy and stable.
  /** @var \Drupal\Core\Extension\ThemeInstallerInterface $theme_installer */
  $theme_installer = \Drupal::service('theme_installer');
  $theme_installer->install(['stable9']);
}

/**
 * Uninstall old themes: stable.
 */
function cgov_core_post_update_uninstall_stable() {
  // Remove classy and stable.
  /**@var \Drupal\Core\Extension\ThemeHandlerInterface $theme_handler */
  $theme_handler = \Drupal::service('theme_handler');
  /** @var \Drupal\Core\Extension\ThemeInstallerInterface $theme_installer */
  $theme_installer = \Drupal::service('theme_installer');
  if ($theme_handler->themeExists('stable')) {
    $theme_installer->uninstall(['stable']);
  }
}

/**
 * Updates citation content to use ncids_streamlined_no_headings.
 */
function cgov_core_post_update_citation_content_streamlined_format(): string {
  $db = \Drupal::database();
  $bundle = 'cgov_citation';
  $old_format = 'streamlined';
  $new_format = 'ncids_streamlined_no_headings';

  $base_count = $db->update('paragraph__field_citation_content')
    ->fields(['field_citation_content_format' => $new_format])
    ->condition('bundle', $bundle)
    ->condition('field_citation_content_format', $old_format)
    ->execute();

  $revision_count = $db->update('paragraph_revision__field_citation_content')
    ->fields(['field_citation_content_format' => $new_format])
    ->condition('bundle', $bundle)
    ->condition('field_citation_content_format', $old_format)
    ->execute();

  return "Updated text formats on $base_count paragraphs and $revision_count paragraph revisions.";
}
