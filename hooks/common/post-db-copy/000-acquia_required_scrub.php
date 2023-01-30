#!/usr/bin/env php
<?php

/**
 * @file
 * Scrubs a site after its database has been copied.
 *
 * This happens on staging, not on site duplication; duplication does not call
 * the 'db-copy' Acquia Hosting task which executes this hook.
 */

/**
 * Recursively removes a directory.
 *
 * @param string $dir
 *   Directory that will be removed.
 */
function rmdir_r(string $dir) {
  if (is_dir($dir)) {
    // Acquia rules disallow exec() with dynamic arguments.
    // phpcs:disable
    shell_exec(sprintf('rm -rf %s', escapeshellarg($dir)));
    // phpcs:enable
  }
}

/**
 * Creates a new directory if it doesn't exist already.
 *
 * Also, creates parent directories if needed.
 *
 * @param string $dir
 *   Directory to create.
 */
function mkdir_p(string $dir) {
  if (!file_exists($dir)) {
    mkdir($dir, 0777, TRUE);
  }
}

/**
 * Returns Drush cache location based on site, environment and domain.
 *
 * @param string $site
 *   Site name.
 * @param string $env
 *   Site environment.
 * @param string $domain
 *   Site domain.
 *
 * @return string
 *   Drush cache location.
 */
function drush_cache_path(string $site, string $env, string $domain) {
  return sprintf('/mnt/tmp/%s.%s/drush_tmp_cache/%s', $site, $env, hash('sha256', $domain));
}

/**
 * Runs Drush command. Exits with error code if something fails.
 *
 * @param string $site
 *   Target site.
 * @param string $env
 *   Target environment.
 * @param string $domain
 *   Target domain.
 * @param string $cmd
 *   Command that will be run.
 */
function drush_exec(string $site, string $env, string $domain, string $cmd) {
  $docroot = sprintf('/var/www/html/%s.%s/docroot', $site, $env);

  $drush_cmd = sprintf(
    'DRUSH_PATHS_CACHE_DIRECTORY=%1$s CACHE_PREFIX=%1$s AH_SITE_ENVIRONMENT=%2$s \drush8 -r %3$s -l %4$s -y %5$s 2>&1',
    escapeshellarg(drush_cache_path($site, $env, $domain)),
    escapeshellarg($env),
    escapeshellarg($docroot),
    escapeshellarg('https://' . $domain),
    $cmd
  );

  fwrite(STDERR, "Executing: $drush_cmd;\n");
  $result = 0;
  $output = [];
  // Acquia rules disallow exec() with dynamic arguments.
  // phpcs:disable
  exec($drush_cmd, $output, $result);
  // phpcs:enable
  print implode("\n", $output);

  fwrite(STDERR, "Command execution returned status code: $result\n");

  // In case the returned status code ($result) is not 0, we'll remove the drush
  // cache directory and halt the execution of the whole script.
  if ($result) {
    rmdir_r(drush_cache_path($site, $env, $domain));
    exit($result);
  }

  return $output;
}

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

include_once $docroot . '/sites/g/sites.inc';
$sites_json = gardens_site_data_load_file();
if (!$sites_json) {
  // If the file exists, and cannot be loaded, exit with an error.
  if (file_exists(gardens_site_data_get_filepath())) {
    fwrite(STDERR, "The site registry could not be loaded from the server.\n");
    exit(1);
  }
  // Exit gracefully if the sites.json is not available. That usually
  // indicates that the code is running on a non-acsf environment.
  fwrite(STDERR, "The site registry does not exist; this doesn't look like an ACSF environment.\n");
  exit(0);
}

fwrite(STDERR, sprintf("Scrubbing site database: site: %s; env: %s; db_role: %s;\n", $site, $env, $db_role));

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
      $docroot = sprintf('/var/www/html/%s.%s/docroot', $site, $env);
    }
    break;
  }
}

if (!$new_domain) {
  error('Could not find the domain that belongs to the site.');
}

// Make directory drush will use for temporary cache.
mkdir_p(drush_cache_path($site, $env, $new_domain));

// Check for the availability of the 'cache_container' table.
fwrite(STDERR, "Checking the availability of 'cache_container' table.\n");
$cache_table_check = drush_exec($site, $env, $new_domain, 'sqlq "SHOW TABLES LIKE \'cache_container\';"');
$cache_table_check = array_shift($cache_table_check);
// An empty value/string means that no 'cache_container' table was found.
if (!empty($cache_table_check)) {
  // Make absolutely sure Drupal will not pick up cached component locations
  // on boostrap when called by Drush cache-rebuild.
  // The following Drush cache-rebuild will repopulate this table.
  fwrite(STDERR, "Table was found. Deleting all data from the 'cache_container' table.\n");
  drush_exec($site, $env, $new_domain, 'sqlq "TRUNCATE TABLE cache_container;"');
}

// Explicitly run a cache-rebuild before anything else.
drush_exec($site, $env, $new_domain, 'cache-rebuild');

// Execute the scrub. If we execute code on the update environment (as per
// above), we must change AH_SITE_ENVIRONMENT to match the docroot during
// execution; see sites.php.
drush_exec($site, $env, $new_domain, 'acsf-site-scrub');

// Clean up the drush cache directory.
rmdir_r(drush_cache_path($site, $env, $new_domain));
