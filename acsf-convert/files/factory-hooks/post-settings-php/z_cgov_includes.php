<?php

/**
 * @file
 * Implements includes for cgov.
 */

// Add cgov configs from global settings.
$additionalSettingsFiles = [
  ( DRUPAL_ROOT . '/sites/settings/cgov_caching.settings.php' ),
  ( DRUPAL_ROOT . '/sites/settings/cgov_core.settings.php' ),
];

foreach ($additionalSettingsFiles as $settingsFile) {
  if (file_exists($settingsFile)) {
    require $settingsFile;
  }
}
