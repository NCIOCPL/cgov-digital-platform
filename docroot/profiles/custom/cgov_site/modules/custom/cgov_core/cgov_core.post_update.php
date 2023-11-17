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
