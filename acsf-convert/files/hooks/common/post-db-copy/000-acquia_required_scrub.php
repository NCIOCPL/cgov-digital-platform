#!/usr/bin/env php
<?php

/**
 * @file
 * Scrubs a site after its database has been copied.
 *
 * This happens on staging, not on site duplication; duplication does not call
 * the 'db-copy' Acquia Hosting task which executes this hook.
 */

if (empty($argv[3])) {
  echo "Error: Not enough arguments.\n";
  exit(1);
}

// AH site group.
$site = $argv[1];
// AH site env.
$env = $argv[2];
// Database name.
$db_role = $argv[3];

$docroot = sprintf('/var/www/html/%s.%s/docroot', $site, $env);

fwrite(STDERR, sprintf("Scrubbing site database: site: %s; env: %s; db_role: %s;\n", $site, $env, $db_role));

include_once $docroot . '/sites/g/sites.inc';
$sites_json = gardens_site_data_load_file();
if (!$sites_json) {
  error('The site registry could not be loaded from the server.');
}
$new_domain = FALSE;
foreach ($sites_json['sites'] as $site_domain => $site_info) {
  if ($site_info['conf']['acsf_db_name'] === $db_role && !empty($site_info['flags']['preferred_domain'])) {
    $new_domain = $site_domain;
    fwrite(STDERR, "Site domain: $new_domain;\n");

    // When the site being staged has different a code than its source, the
    // original code will be deployed on the update environment to ensure that
    // the scrubbing process will not fail due to code / data structure
    // differences.
    if (!empty($site_info['flags']['staging_exec_on'])) {
      $env = $site_info['flags']['staging_exec_on'];
    }
    break;
  }
}
if (!$new_domain) {
  error('Could not find the domain that belongs to the site.');
}

$docroot = sprintf('/var/www/html/%s.%s/docroot', $site, $env);

// Create a cache directory for drush.
$cache_directory = sprintf('/mnt/tmp/%s.%s/drush_tmp_cache/%s', $site, $env, md5($new_domain));
shell_exec(sprintf('mkdir -p %s', escapeshellarg($cache_directory)));

// Execute the scrub. If we execute code on the update environment (as per
// above), we must change AH_SITE_ENVIRONMENT to match the docroot during
// execution; see sites.php.
$command = sprintf(
  'CACHE_PREFIX=%s AH_SITE_ENVIRONMENT=%s \drush8 -r %s -l %s -y acsf-site-scrub',
  escapeshellarg($cache_directory),
  escapeshellarg($env),
  escapeshellarg($docroot),
  escapeshellarg('https://' . $new_domain)
);
fwrite(STDERR, "Executing: $command;\n");

$result = 0;
$output = [];
exec($command, $output, $result);
print implode("\n", $output);

// Clean up the drush cache directory.
shell_exec(sprintf('rm -rf %s', escapeshellarg($cache_directory)));

if ($result) {
  fwrite(STDERR, "Command execution returned status code: $result!\n");
  exit($result);
}
