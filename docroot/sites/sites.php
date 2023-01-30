<?php

/**
 * @file
 * Drupal multi-site configuration file for sites on Acquia Cloud Site Factory.
 *
 * See Drupal's example.sites.php for general information on this file.
 *
 * In short: this file is supposed to populate the $sites variable for use by
 * the caller, with a mapping from domain names to site specific directories.
 * If the requested domain has a site specific directory defined, the caller
 * (likely) includes the settings.php in that specific directory rather than
 * sites/default/settings.php.
 *
 * Acquia Cloud Site Factory has its own storage of per-domain data, which is
 * read by this file to get the needed info. In addition, the global variable
 * $gardens_site_settings is populated with various per-site information, for
 * use by the site specific settings.php file. (See: sites/g/settings.php).
 *
 * If an error occurs or the domain is not found, then we quit processing
 * without setting $sites. The caller then (likely) includes
 * sites/default/acsf.settings.php from sites/default/settings.php, which will
 * emit a "Site not found" response. That response can be customized by
 * modifying sites/default/settings.php.
 *
 * (At least Acquia's standard) Drush aliases are *not supported* for usage
 * with Acquia Cloud Site Factory. Drush9 commands simply don't work with them.
 */

// Protect against sites.php being included from the wrong docroot, on Acquia
// servers containing multiple (staging) environments for a customer. This is
// a known issue only in previous versions of the module which worked with
// Drush7/8 + Acquia's aliases, but it seems prudent to do this check anyway.
// Notes:
// - The environment values are always defined on Acquia hardware. If they are
//   not defined, we cannot assume anything about the file system structure so
//   we skip this check.
// - realpath() includes AH_SITE_NAME; we instead want to match
//   AH_SITE_GROUP.AH_SITE_ENVIRONMENT (which is always a symlink)
//   - to accommodate for possible future changes or botched provisioning;
//   - because Site Factory doesn't use AH_SITE_NAME anywhere else;
//   - because AH_SITE_NAME may not be correct in some cases, e.g. when our
//     post-db-copy/000-acquia_required_scrub.php hook executes acsf-site-scrub.
if (isset($_ENV['AH_SITE_NAME']) && isset($_ENV['AH_SITE_ENVIRONMENT'])
  && strpos(__FILE__, (string) realpath("/var/www/html/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/docroot")) !== 0
  && strpos(__FILE__, (string) realpath("/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/livedev/docroot")) !== 0
) {
  return;
}

if (!function_exists('acsf_hooks_includes')) {

  /**
   * Scans a factory-hooks sub-directory and returns PHP files to be included.
   *
   * @param string $hook_name
   *   The name of the hook whose files should be returned.
   *
   * @return string[]
   *   A list of customer-defined hook files to include sorted alphabetically
   *   ascending.
   */
  function acsf_hooks_includes($hook_name) {
    // Only include hooks if we are properly booting Drupal.
    if (!defined('DRUPAL_ROOT')) {
      return [];
    }
    $hook_pattern = sprintf('%s/../factory-hooks/%s/*.php', DRUPAL_ROOT, $hook_name);
    return glob($hook_pattern);
  }

}

// Include custom sites.php code from factory-hooks/pre-sites-php.
foreach (acsf_hooks_includes('pre-sites-php') as $_acsf_include_file) {
  // This should not use include_once / require_once. Some Drush versions do
  // Drupal bootstrap multiple times, and include_once / require_once would
  // make the hook modifications not be included on the second bootstrap.
  // Acquia rules disallow 'include/require' with dynamic arguments.
  // phpcs:disable
  include $_acsf_include_file;
  // phpcs:enable
}

if (!function_exists('is_acquia_host')) {

  /**
   * Checks whether the site is on Acquia Hosting.
   *
   * @return bool
   *   TRUE if the site is on Acquia Hosting, otherwise FALSE.
   */
  function is_acquia_host() {
    return file_exists('/var/acquia');
  }

}

// Check that we are on an Acquia server so we do not run this code for local
// development.
if (!is_acquia_host()) {
  return;
}

// This safeguard should not be necessary since we stopped executing sites.php
// on unrelated environments (above). We keep it only in case removing it would
// have an effect in exotic unknown cases.
if (!function_exists('gardens_site_data_load_file')) {
  require_once __DIR__ . '/g/sites.inc';
}

// Prevents to run further if the sites.json file doesn't exists.
// This step also tries to prevent errors on a none acsf environment.
if (empty($_ENV['AH_SITE_GROUP']) || empty($_ENV['AH_SITE_ENVIRONMENT']) || !function_exists('gardens_site_data_get_filepath') || !file_exists(gardens_site_data_get_filepath())) {
  return;
}

$_tmp = gardens_site_data_get_site_from_server_info();

// If either "not found" or "read failure" (from either the cache or the
// sites.json file): don't set $sites and fall through (to, probably, reading
// sites/default/settings.php for settings).
if (empty($_tmp)) {
  if ($_tmp === NULL) {
    // If we encountered a read error, indicate that we want the same (short)
    // cache time for the page, as we have for the data in APC.
    $GLOBALS['gardens_site_settings']['page_ttl'] = GARDENS_SITE_DATA_READ_FAILURE_TTL;
  }
  return;
}

// We found a site, so add the corresponding 'configuration directory' to
// $sites, as per the regular sites.php spec. (For most Drupal sites this is
// a single-layer directory equal to a domain name; for us, it is typically
// g/files/SITE-ID.)
$sites[$_tmp['dir_key']] = $_tmp['dir'];
// Also set 'gardens_site_settings' for other code further on. (Mainly
// settings.php.)
$GLOBALS['gardens_site_settings'] = $_tmp['gardens_site_settings'];

// Include custom sites.php code from factory-hooks/post-sites-php, only when
// a domain was found.
foreach (acsf_hooks_includes('post-sites-php') as $_acsf_include_file) {
  // Acquia rules disallow 'include/require' with dynamic arguments.
  // phpcs:disable
  include $_acsf_include_file;
  // phpcs:enable
}
