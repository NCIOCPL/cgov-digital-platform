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
  switch ($_ENV['AH_SITE_ENVIRONMENT']) {
    case '01dev':
    case 'dev':
      // Disable aggregation of CSS and JS on dev.
      $config['system.performance']['css']['preprocess'] = FALSE;
      $config['system.performance']['css']['gzip'] = FALSE;
      $config['system.performance']['js']['preprocess'] = FALSE;
      $config['system.performance']['js']['gzip'] = FALSE;
    case '01test':
    case 'test':
    case '01live':
      // Cache settings.
      $config['system.performance']['cache']['page']['max_age'] = 16588800;
      break;
  }

  $config['system.performance']['css']['preprocess'] = TRUE;
  $config['system.performance']['css']['gzip'] = TRUE;
  $config['system.performance']['js']['preprocess'] = TRUE;
  $config['system.performance']['js']['gzip'] = TRUE;

  // Setup proper .edgerc path for Akamai module
  $ah_group = isset($_ENV['AH_SITE_GROUP']) ? $_ENV['AH_SITE_GROUP'] : NULL;
  $config['akamai.settings']['edgerc_path'] = "/mnt/gfs/home/$ah_group/common/.edgerc";

}
