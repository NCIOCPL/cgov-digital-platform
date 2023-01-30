<?php

/**
 * @file
 * This file regenerates the APC cache from JSON sites data.
 *
 * @see https://confluence.acquia.com/x/kBre for usage instructions.
 */

$file = "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/files-private/sites.json";
if (!file_exists($file)) {
  syslog(LOG_ERR, sprintf('APC cache update could not be executed, as the JSON file [%s] is missing.', $file));
  header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
  die('Missing sites file.');
}

// We also pass some info about the source file for minimal authentication.
$file_contents = file_get_contents($file);
$token = sha1($file_contents);
if (empty($_GET['token']) || $_GET['token'] !== $token) {
  syslog(LOG_ERR, sprintf('APC cache update verification parameter [%s] does not match actual data [%s].', $_GET['token'], $token));
  header($_SERVER['SERVER_PROTOCOL'] . ' 401 Unauthorized');
  die('Invalid.');
}

require_once __DIR__ . '/sites.inc';

if (!empty($_GET['domains'])) {
  $domains = explode(',', $_GET['domains']);
  // Refresh data for specified domains. If the domains are not found (which
  // could be caused by the domain not being present or by a read failure of the
  // sites.json file), that fact will be cached in APC for each domain passed.
  gardens_site_data_refresh_domains($domains);
  syslog(LOG_INFO, sprintf('Updated APC cache for [%s].', $_GET['domains']));
}
else {
  // Refresh data for all domains present in sites.json. If there is a read
  // failure, the cache will not be refreshed.
  gardens_site_data_refresh_all();
  syslog(LOG_INFO, 'Updated APC cache for all domains.');
}
