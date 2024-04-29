<?php

/**
 * @file
 * Implementation of cache settings for ACE + ACSF.
 *
 * @see https://docs.acquia.com/site-factory/tiers/paas/workflow/hooks
 */

require_once 'cgov_settings_utilities.inc';

$env = CGovSettingsUtil::getEnvironmentName();
$domain = CGovSettingsUtil::getDomain();

// Set the domain for use when purging the cache.
$settings['cgdp.cache_url_host'] = 'https://' . $domain;

// Verify we're on an Acquia-hosted environment.
if (CGovSettingsUtil::isAcquia()) {

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

  // ODEs are not behind Akamai, but everything else conceivably could be.
  if ($env != 'ode') {
    // Setup proper .edgerc path for Akamai module
    $ah_group = isset($_ENV['AH_SITE_GROUP']) ? $_ENV['AH_SITE_GROUP'] : NULL;
    $config['akamai.settings']['edgerc_path'] = "/mnt/gfs/home/$ah_group/common/.edgerc";
    $config['akamai.settings']['basepath'] = 'https://' . $domain;
  }
}
