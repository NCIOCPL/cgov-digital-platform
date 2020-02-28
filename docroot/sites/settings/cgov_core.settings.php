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

// Set up the Drupal 8 fast 404 functionality in order to avoid the overhead
// of rendering a fully-themed error page in certain cases by outputting a hard-coded
// basic error page.
//
// Only render a themed 404 page on one path.
$config['system.performance']['fast_404']['exclude_paths'] = '/\/Real404Page/i';
// Use fast 404 everywhere else.
$config['system.performance']['fast_404']['paths'] = '/.*/';
// The actual page.
$config['system.performance']['fast_404']['html'] = '<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>Not Found</h1><p>The URL "@path" was not found on this server.</p></body></html>';

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
  foreach($domains as $site_name => $site_info) {
    if (!empty($site_info['flags']['preferred_domain'])) {
      $domain = $site_name;
    }
  }
  $config['simple_sitemap.settings']['base_url'] = 'https://' . $domain;
} else {
  // NOTE: you can override this in your local.settings.php.
  $config['simple_sitemap.settings']['base_url'] = 'https://www.cancer.gov';
}
