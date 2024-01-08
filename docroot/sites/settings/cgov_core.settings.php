<?php

/**
 * @file
 * Implementation of any core settings.
 *
 * @see https://docs.acquia.com/site-factory/tiers/paas/workflow/hooks
 */

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

// Pass in the correct ACSF site name to build the sitemap.xml.
// The base_url is picked up from, well, who knows what actually. It should be
// what is passed in for the --uri flag to drush for the cron, but then again
// it should appear as the site factory name? In any case we want to find the
// preferred domain, which should always be the public facing one. This is
// the name that shows on the card for the site. Anyway, you should always
// add that one as the first domain when creating a site, and then we will
// make sure that shows up in the sitemap.xml with the following code.
if ($is_acsf_env && $acsf_db_name) {
  $domains = gardens_data_get_sites_from_file($GLOBALS['gardens_site_settings']['conf']['acsf_db_name']);
  // Full disclosure, I don't know if the preferred_domain is always set.
  $domain = array_keys($domains)[0];
  foreach ($domains as $site_name => $site_info) {
    if (!empty($site_info['flags']['preferred_domain'])) {
      $domain = $site_name;
    }
  }
  $config['simple_sitemap.settings']['base_url'] = 'https://' . $domain;
} else {
  // NOTE: you can override this in your local.settings.php.
  $config['simple_sitemap.settings']['base_url'] = 'https://www.cancer.gov';
}

// Get our current environment
if (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT'])) {
  $env = $_ENV['AH_SITE_ENVIRONMENT'];
  if (preg_match('/^ode\d*$/', $env)) {
    $env = 'ode';
  }
} else {
  $env = 'local';
}
// Settings for metatag attribute cgdp.domain.
if($is_acsf_env && $acsf_db_name) {
  // For ACSF env.
  $acsf_domains = array_keys(gardens_data_get_sites_from_file($GLOBALS['gardens_site_settings']));
  foreach ($acsf_domains as $domain_value) {
    if(preg_match('/acsitefactory.com/', $domain_value)){
      $temp = explode('.', $domain_value);
      if($temp[1] == $_ENV['AH_SITE_GROUP']){
        $domain_env = $temp[0];
      }else {
        $acsf_env = str_replace('-' . $_ENV['AH_SITE_GROUP'], '', $temp[1]);
        $domain_env = $temp[0] . '-' . $acsf_env;
      }
    }
  }
  $settings['cgdp_domain'] = $domain_env;
}
else {
  $settings['cgdp_domain'] = $env;
}

// on non-prod environments, route emails to logger
if ($env !== "01live") {
  // route e-mails to the logger.
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

// Get the license dir from our current environment
$licenseDir = '/var/licenses';
if (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT'])) {
  if ($env === 'ode') {
    // ODEs get spun up dynamically and for now we want to store this in the
    // homedirectory which does not change. In the future if we automate
    // creation of ODEs we can push up our files to the /mnt/files directories
    // for the ODEs.
    $licenseDir = "/home/{$_ENV['AH_SITE_GROUP']}/licenses";
  } else {
    $licenseDir = "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/licenses";
  }
}

$licenseFilename = sprintf('%s/licenses.php', $licenseDir);
if (file_exists($licenseFilename)) {

  // Load the license keys file.
  require($licenseFilename);

  // Setup CKEditor LTS keys
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
