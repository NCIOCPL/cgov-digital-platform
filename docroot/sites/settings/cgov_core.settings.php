<?php

/**
 * @file
 * Implementation of any core settings.
 *
 * @see https://docs.acquia.com/site-factory/tiers/paas/workflow/hooks
 */

require_once 'cgov_settings_utilities.inc';

$env = CGovSettingsUtil::getEnvironmentName();
$domain = CGovSettingsUtil::getDomain();

/*
 * Set the translation path to allow for easy management of third-party
 * translation files. The installer ignores the path for the initial install,
 * but it will honor the use source. (It is here as configs will not be set
 * before the installation starts.)
 *
 * There is a known issue where the installer will not honor the override for the
 * path because it is hardcoded in the installer code.
 * https://www.drupal.org/project/drupal/issues/2689305
 */
$config['locale.settings']['translation']['use_source'] = 'local';
$config['locale.settings']['translation']['path'] = DRUPAL_ROOT . '/translations';

// Pass in the correct domain name to build the sitemap.xml.
// NOTE: you can override this in your local.settings.php.
$config['simple_sitemap.settings']['base_url'] = 'https://' . $domain;

// Load MEO multisite configuration.
$meo_site_php_path = DRUPAL_ROOT . '/sites/sites.php';
if (!is_file($meo_site_php_path)) {
  throw new \RuntimeException("Cannot find $meo_site_php_path");
}

require $meo_site_php_path;

if (!isset($sites) || !is_array($sites)) {
  throw new \RuntimeException("Multi-site not defined in $meo_site_php_path");
}

// Settings for metatag attribute cgdp.domain.
if ($_ENV['AH_ENVIRONMENT_TYPE'] === 'meo') {
  // For MEO env.
  $meo_domains = array_keys($sites);
  foreach ($meo_domains as $domain_value) {
    if (preg_match('/\.acquia-sites\.com$/', $domain_value)) {
      // Parse domain format: ccg-ncigovmeoprod.prod.acquia-sites.com.
      // Extract site name from the first part before the dash.
      $temp = explode('.', $domain_value);
      $site_and_name = $temp[0];
      $site_parts = explode('-', $site_and_name, 2);
      $site_name = $site_parts[0];
      // Use AH_SITE_ENVIRONMENT for the actual environment.
      $domain_env = $site_name . '-' . $_ENV['AH_SITE_ENVIRONMENT'];
      break;
    }
  }
  $settings['cgdp_domain'] = $domain_env ?? $env;
}
else {
  $settings['cgdp_domain'] = $env;
}

// On non-prod environments, route emails to logger.
if ($_ENV['AH_ENVIRONMENT_TYPE'] === 'meo' && $env !== "prod") {
  // Route e-mails to the logger.
  $config['system.mail']['interface']['default'] = 'cgov_mail_logger';
}

// Outlook doesn't adhere to standards, so accommodating and using
// CRLF line-endings.
$settings['mail_line_endings'] = "\r\n";

// Define unwanted routes to disable and show access denied.
$settings['disallow_routes'] = [
  'user.reset.login',
  'user.reset',
  'user.reset.form',
];

// Get the license dir from our current environment.
$licenseDir = '/var/licenses';
if (CGovSettingsUtil::isAcquia()) {
  $licenseDir = "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/licenses";
}

$licenseFilename = sprintf('%s/licenses.php', $licenseDir);
if (file_exists($licenseFilename)) {

  // Load the license keys file.
  require $licenseFilename;

  // Setup CKEditor LTS keys.
  if (array_key_exists('ckeditor_lts', $cgdp_license_keys)) {

    // Set the default key if a specific environment key does not exist.
    if (array_key_exists('default', $cgdp_license_keys['ckeditor_lts'])) {
      $config['ckeditor.lts.settings']['license_key'] = $cgdp_license_keys['ckeditor_lts']['default'];
    }
    // Set the specific environment key.
    if (array_key_exists($env, $cgdp_license_keys['ckeditor_lts'])) {
      $config['ckeditor.lts.settings']['license_key'] = $cgdp_license_keys['ckeditor_lts'][$env];
    }
  }

}
