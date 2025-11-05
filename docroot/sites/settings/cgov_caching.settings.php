<?php

/**
 * @file
 * Implementation of cache settings for ACE + MEO.
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

  // All Acquia environments should have the same max cache age of 192 days.
  $config['system.performance']['cache']['page']['max_age'] = 16588800;

  // ODEs are not behind Akamai, but everything else conceivably could be.
  if ($env != 'ode') {
    // Setup proper .edgerc path for Akamai module.
    $ah_group = isset($_ENV['AH_SITE_GROUP']) ? $_ENV['AH_SITE_GROUP'] : NULL;
    $config['akamai.settings']['edgerc_path'] = "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/cgdp/edgerc";
    $config['akamai.settings']['basepath'] = 'https://' . $domain;
  }
}
