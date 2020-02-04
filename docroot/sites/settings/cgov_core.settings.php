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
}
else {
  // NOTE: you can override this in your local.settings.php.
  $config['simple_sitemap.settings']['base_url'] = 'https://www.cancer.gov';
}

// If this is a local environment or non-production (01live) environment
// route e-mails to the logger.
if (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT'])) {
  // Alter '01dev,' '01test', and '01live' to match
  // your website's environment names.
  $env = $_ENV['AH_SITE_ENVIRONMENT'];
  if (preg_match('/^ode\d*$/', $env)) {
    $env = 'ode';
  }
  switch ($env) {
    case '01live':
      break;

    case '01dev':
    case 'dev':
    case '01test':
    case 'test':
    case 'ode':
    default:
      $config['system.mail']['interface']['default'] = 'cgov_mail_logger';
      break;
  }
}
else {
  $config['system.mail']['interface']['default'] = 'cgov_mail_logger';
}
