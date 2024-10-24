<?php

/**
 * @file
 * Implementation of cache settings for ACE + ACSF.
 *
 * @see https://docs.acquia.com/site-factory/tiers/paas/workflow/hooks
 */

// Verify we're on an Acquia-hosted environment.
if (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT'])) {
  // Alter '01dev,' '01test', and '01live' to match
  // your website's environment names.
  $env = $_ENV['AH_SITE_ENVIRONMENT'];
  if (preg_match('/^ode\d*$/', $env)) {
    $env = 'ode';
  }

  $config['system.performance']['css']['preprocess'] = TRUE;
  $config['system.performance']['css']['gzip'] = TRUE;
  $config['system.performance']['js']['preprocess'] = TRUE;
  $config['system.performance']['js']['gzip'] = TRUE;

  switch ($env) {
    case 'dev':
    case '01dev':
    case 'int':
    case '01test':
    case 'test':
    case '01live':
    case 'ode':
      // Cache settings.
      $config['system.performance']['cache']['page']['max_age'] = 16588800;
      break;
  }

  // Setup proper .edgerc path for Akamai module
  $ah_group = isset($_ENV['AH_SITE_GROUP']) ? $_ENV['AH_SITE_GROUP'] : NULL;
  $config['akamai.settings']['edgerc_path'] = "/mnt/gfs/home/$ah_group/common/.edgerc";

  // Configure the Akamai basepath
  if ($is_acsf_env && $acsf_db_name) {
    $domains = gardens_data_get_sites_from_file($GLOBALS['gardens_site_settings']['conf']['acsf_db_name']);
    $domain = array_keys($domains)[0];
    foreach ($domains as $site_name => $site_info) {
      if (!empty($site_info['flags']['preferred_domain'])) {
        $domain = $site_name;
      }
    }
    $config['akamai.settings']['basepath'] = 'https://' . $domain;
  } elseif (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT'])) {
    $env = $_ENV['AH_SITE_ENVIRONMENT'];
    if (!preg_match('/^ode\d*$/', $env)) {
      $config['akamai.settings']['basepath'] = 'https://www-' . $env . '-ac.cancer.gov';
    }
  }

}
