<?php

/**
 * @file
 * ACSF helper functions for Drupal's multi-site directory aliasing feature.
 *
 * Make sure to use require_once() so this file is never loaded more than
 * once per page.
 */

use Acquia\Cloud\Environment\MultiSite\Config;
use Acquia\SimpleRest\SimpleRestCreds;
use Acquia\SimpleRest\SimpleRestMessage;
use Acquia\SimpleRest\SimpleRestResponse;
use Drush\Drush;

// Load SimpleRest classes, needed for sending requests to the Site Factory.
// @todo if we ever change/test gardens_site_data_alert_send(), we should move
//   this include_once() into there. It is perfectly fine to execute in a
//   shutdown function (as long as we don't make assumptions about the cwd).
include_once dirname(__FILE__) . '/SimpleRest.php';

// Bail out if we're not on an Acquia server.
if (function_exists('is_acquia_host') && !is_acquia_host()) {
  return;
}

define('GARDENS_SITE_DATA_USE_APC', (get_cfg_var('gardens.disable_apc_for_sites_php') != 1));
// TTL set to 30 minutes to allow a cron to run full refreshes.
define('GARDENS_SITE_DATA_TTL', 1800);
// 'Domain not found' is unlikely to be triggered for most customers (because it
// requires a hostname on the balancer to be pointing to us), but can happen for
// customers with path based domains (because those hostnames pointing to us +
// whatever path is requested, is not necessarily a domain registered in
// sites.json). We do want Varnish to keep its regular caching times for the
// "Site not found" page served by our acsf.settings.php. An empty sites.json is
// equivalent to "domain not found" in our code; in this case we would rather
// not cache anything, but it's not hugely important. Based on this, we can
// either set a high value like above, or a low value because Varnish will
// shield us from repeated HTTP requests anyway. (CLI requests don't have APC.)
define('GARDENS_SITE_DATA_NOT_FOUND_TTL', 60);
// Read failure is likely gluster acting up. In this case we will want to
// dramatically shorten the cache time for both APC and Varnish. (It's unclear
// whether we even need APC at all.) This means that extended read failures will
// increase hits on Drupal (at least on the path through sites.php ->
// acsf.settings.php -> "Site not found" page), but that's better than having
// sites be unreachable for too long.
define('GARDENS_SITE_DATA_READ_FAILURE_TTL', 60);
// Note: a nonexistent sites.json leads to no caching at all.
// The path (template) to the lock file that should be checked when sites.json
// is unreadable. Sitegroup + env need to be filled.
define('GARDENS_SITE_JSON_ALERT_LOCK_TEMPLATE', '/mnt/tmp/%s.%s/.sites-json-alert');

// The PHP configuration is used to switch between the new and the legacy
// site.json usage. The new approach uses the interface provided by the
// Acquia Cloud layer, the legacy approach uses the file deployed to gluster.
define('GARDENS_SITE_JSON_LEGACY', empty(get_cfg_var('acsf.sites_json_on_ephemeral')));

// This fallback to populate $_ENV should not be necessary on Acquia Hosting
// anymore. Also, ah_site_info() is not a public API and not guaranteed to
// keep existing. Still, we keep it for exotic environments which may be using
// it to insert the environment values, e.g. local development environments.
if (!isset($_ENV['AH_SITE_NAME']) || !isset($_ENV['AH_SITE_GROUP']) || !isset($_ENV['AH_SITE_ENVIRONMENT'])) {
  if (!function_exists('ah_site_info') && file_exists('/var/www/site-scripts/site-info.php')) {
    require_once '/var/www/site-scripts/site-info.php';
  }
  if (function_exists('ah_site_info')) {
    list($name, $group, $stage, $secret) = ah_site_info();
    if (!isset($_ENV['AH_SITE_NAME'])) {
      $_ENV['AH_SITE_NAME'] = $name;
    }
    if (!isset($_ENV['AH_SITE_GROUP'])) {
      $_ENV['AH_SITE_GROUP'] = $group;
    }
    if (!isset($_ENV['AH_SITE_ENVIRONMENT'])) {
      $_ENV['AH_SITE_ENVIRONMENT'] = $stage;
    }
  }
}

/**
 * Returns the sites data structure.
 *
 * @return bool|mixed
 *   An array of sites data on success, or FALSE on failure to load or parse the
 *   file.
 */
function gardens_site_data_load_file() {
  if (GARDENS_SITE_JSON_LEGACY) {
    // Retrieve sites.json data from a gluster file.
    $json = @file_get_contents(gardens_site_data_get_filepath());
    return $json ? json_decode($json, TRUE) : FALSE;
  }
  else {
    // Retrieve sites data using the interface provided by the Acquia Cloud
    // layer.
    $config = Config::getInstance();
    return empty($config) ? FALSE : $config->all();
  }
}

/**
 * Checks for a registered ACSF site based on Apache server variables.
 *
 * Prerequisite: $_SERVER and $_ENV are both populated as per Acquia practices.
 *
 * @return array|int|null
 *   0 if no site was found for the given domain; NULL if a sites.json read
 *   failure was encountered; otherwise, an array of site data as constructed
 *   by gardens_site_data_build_data() - with an added key 'dir_key' containing
 *   the key where sites.php would expect to set this site's directory in its
 *   '$sites' variable.
 *
 * @see gardens_site_data_build_data()
 */
function gardens_site_data_get_site_from_server_info() {
  // First derive the 'site uri' (the base domain with possibly a sub path).
  if (PHP_SAPI === 'cli' && class_exists('\Drush\Drush') && Drush::hasContainer()) {
    $acsf_drush_boot_manager = Drush::bootstrapManager();
    if ($acsf_drush_boot_manager->getUri()) {
      $acsf_uri = $acsf_drush_boot_manager->getUri();
    }
    // Drush site-install gets confused about the uri when we specify the
    // --sites-subdir option. By specifying the --acsf-install-uri option with
    // the value of the standard domain, we can catch that here and correct the
    // uri argument for drush site installs.
    $acsf_drush_input = Drush::input();
    try {
      $acsf_install_uri = $acsf_drush_input->getOption('acsf-install-uri');
      if ($acsf_install_uri) {
        $acsf_uri = $acsf_install_uri;
      }
    }
    catch (InvalidArgumentException $e) {
    }
    if (!preg_match('|https?://|', $acsf_uri)) {
      $acsf_uri = 'http://' . $acsf_uri;
    }
    $host = $_SERVER['HTTP_HOST'] = parse_url($acsf_uri, PHP_URL_HOST);
    $path = parse_url($acsf_uri, PHP_URL_PATH);
  }
  else {
    $host = rtrim($_SERVER['HTTP_HOST'], '.');
    $path = $_SERVER['SCRIPT_NAME'] ? $_SERVER['SCRIPT_NAME'] : $_SERVER['SCRIPT_FILENAME'];
    // Path based domains are implemented by symlinking a subdirectory back to
    // the docroot. To support these, we need to know which part of the script
    // path is the domain sub path, and which is a URL path inside the website.
    // (Note our only concern in 'supporting path based domains' is locating
    // the right site. How the request would derive the right URL inside that
    // site is not up to us, and the only thing that is actually known to work
    // with path based domains -through HTTP requests or Drush- is the standard
    // index.php.)
    if (substr($path, -10) === '/index.php') {
      // Assume the requested index.php is in the root, meaning that the full
      // script path leading up to it is the domain sub path. In other words:
      // we do not support index.php being anywhere else except the docroot.
      // This goes for every customer, not just those using path based domains.
      $path = substr($path, 0, strlen($path) - 10);
    }
    else {
      // For any non-index.php path, assume the sub path is empty. In other
      // words: simply do not support path based domains for these.
      $path = '';
    }
  }

  // Convert host/path to lower case because our registry stores data this way;
  // upper cased paths may still not be recognized (by Drush commands, unless
  // there is a symlink matching the specific case) though.
  $host = strtolower($host);

  if (empty($path)) {
    $path = '';
  }

  // The path may have a trailing slash (because PHP_URL_PATH can contain one,
  // and because a script may have set SCRIPT_NAME to '//index.php'). Unify, so
  // the result is either empty or a path with a leading slash.
  $path = strtolower(rtrim($path, '/'));

  // Get data for the 'site uri' from APC.
  if (GARDENS_SITE_DATA_USE_APC && GARDENS_SITE_JSON_LEGACY) {
    // Check for data in APC: FALSE means no; 0 means "not found" cached in
    // APC; NULL means "sites.json read failure" cached in APC.
    $data = gardens_site_data_cache_get($host . $path);
    if ($data === FALSE) {
      // There's no guarantee about how many times this will be called, because
      // Core doesn't do any caching around the 'conf path'. For instance Drush
      // 7 would will call this file and logic around 19 times during each
      // command; Drush 8 only once and Drush 9.6 increases this to around 4. To
      // minimise gluster access, cache data to a local static cache. We assume
      // that *if* we have data for a given domain at any point during a request
      // on the command line then that data remains the same for the duration of
      // the command execution.
      // For some drush commands (that have bootstrap levels lower than
      // 'configuration', only when run with drush6/drush7), we don't have
      // drupal_static() available. We'll skip caching for those few commands,
      // so sites.json will be read always (which used to be the case for all
      // commands before we implemented this cache).
      if (function_exists('drupal_static')) {
        $static_cache = &drupal_static('acsf_sites_php_site_data');
      }
      else {
        $static_cache = [];
      }
      if (isset($static_cache[$host . $path])) {
        $data = $static_cache[$host . $path];
      }
      else {
        $data = gardens_site_data_refresh_one($host . $path);
        if ($data) {
          // We only cache truthy data ourselves, because we don't want to
          // assume that if a domain is not found (or there's a gluster error),
          // that will stay the same during command execution. Note we also set
          // the static cache if APC is active (which isn't necessary) because
          // it doesn't really matter and because otherwise, we would have to
          // - either replicate the check for APC which is now abstracted away
          //   into gardens_site_data_cache_get()
          // - or move $static_cache into gardens_site_data_cache_get() &
          //   gardens_site_data_cache_set(), which isn't wrong but we prefer
          //   not caching every domain in memory when the full file gets read.
          $static_cache[$host . $path] = $data;
        }
      }
    }
  }
  // Get domain data.
  else {
    $data = gardens_site_data_refresh_one($host . $path);
  }

  if (is_array($data)) {
    // Generate the expected drupal sites.php key for this domain.
    $data['dir_key'] = str_replace('/', '.', $host . $path);
  }

  return $data;
}

/**
 * Returns the location of the sites data json file.
 *
 * We rely on the existence of the files-private directory that's created in
 * /mnt/files next to the public files directory.
 *
 * @return string
 *   The json file location.
 */
function gardens_site_data_get_filepath() {
  // Use the "real" path here rather than the canonical hosting path
  // to minimize symlink traversal.
  return "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/files-private/sites.json";
}

/**
 * Returns the location of the private files directory.
 *
 * The private files directory is supposed to be kept outside of the docroot to
 * make sure that its contents are not directly accessible. This directory
 * should not have a symbolic link in the site's directory.
 *
 * @param string $db_role
 *   The site's db role.
 *
 * @return string
 *   The private files directory location.
 */
function gardens_site_data_get_private_files_directory($db_role) {
  return "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/sites/g/files-private/{$db_role}";
}

/**
 * Returns the location of the public files directory.
 *
 * @param string $db_role
 *   The site's db role.
 *
 * @return string
 *   The public files directory location.
 */
function gardens_site_data_get_public_files_directory($db_role) {
  return "sites/g/files/{$db_role}/files";
}

/**
 * Fully refreshes the APC cached site/domain data, rewriting every key.
 */
function gardens_site_data_refresh_all() {
  if ($map = gardens_site_data_load_file()) {
    foreach ($map['sites'] as $domain => $site) {
      $data = gardens_site_data_build_data($site, $map);
      gardens_site_data_cache_set($domain, $data);
    }
  }
}

/**
 * Returns the data structure for a single site.
 *
 * @param array $site
 *   An array of information about a specific site, containing keys including
 *   'conf', 'flags', 'name' etc.
 * @param array $map
 *   An array containing global information that applies to all sites (site,
 *   env, memcache_inc).
 *
 * @return array
 *   A data structure containing information about a single site.
 */
function gardens_site_data_build_data(array $site, array $map) {
  $db_name = $site['conf']['acsf_db_name'];
  $private_files_directory = gardens_site_data_get_private_files_directory($db_name);
  $public_files_directory = gardens_site_data_get_public_files_directory($db_name);

  return [
    'dir' => "g/files/{$site['name']}",
    // Put some settings into a global used in settings.php.
    'gardens_site_settings' => [
      'site' => $map['cloud']['site'],
      'env' => $map['cloud']['env'],
      'memcache_inc' => !empty($map["memcache_inc"]) ? $map["memcache_inc"] : '',
      'flags' => !empty($site['flags']) ? $site['flags'] : [],
      'conf' => !empty($site['conf']) ? $site['conf'] : [],
      'file_private_path' => file_exists($private_files_directory) ? $private_files_directory : NULL,
      'file_public_path' => file_exists($public_files_directory) ? $public_files_directory : NULL,
    ],
  ];
}

/**
 * Parses the entire JSON sites file and returns a result for a single domain.
 *
 * Use gardens_site_data_refresh_one() for a faster near-equivalent.
 *
 * @param string $domain
 *   A domain name to search for in the JSON.
 *
 * @return array
 *   A gardens site data structure, or zero if the domain was not found.
 */
function gardens_site_data_get_site_from_file($domain) {
  $result = 0;
  // This function does not seem to be used. Issues with the sites.json in here
  // is not handled.
  if ($map = gardens_site_data_load_file()) {
    if (!empty($map['sites'][$domain])) {
      $result = gardens_site_data_build_data($map['sites'][$domain], $map);
    }
  }
  return $result;
}

/**
 * Returns data for a single domain.
 *
 * Optionally also stores the data in APC.
 *
 * @param string $domain
 *   The domain name to look up.
 *
 * @return array|int|null
 *   An array of site data, 0 if no site was found for the given domain, or NULL
 *   if a sites.json read failure was encountered.
 */
function gardens_site_data_refresh_one($domain) {
  if (GARDENS_SITE_JSON_LEGACY) {
    // Using the legacy sites.json file from the gluster, and optionally also
    // stores the data in APC.
    $data = gardens_site_data_refresh_domains([$domain]);
  }
  else {
    // Using interface provided by the Acquia Cloud layer, no APC cache handling
    // in this case.
    $data = gardens_site_data_from_multi_site_config([$domain]);
  }
  return isset($data[$domain]) ? $data[$domain] : NULL;
}

/**
 * Returns data for the specified domains directly from the JSON file.
 *
 * Optionally also stores the data in APC.
 *
 * @param array $domains
 *   The domain names to look up in the JSON file.
 *
 * @return array
 *   An array keyed by the specified domains, whose values are site data arrays
 *   or 0 if no site was found for the given domain. If a domain is not present
 *   in the array keys, this indicates a sites.json read failure.
 */
function gardens_site_data_refresh_domains(array $domains) {
  $location = gardens_site_data_get_filepath();
  $data = [];
  foreach ($domains as $domain) {
    $domain = trim($domain);
    // Below code expects the JSON file to contain newlines such that
    // - all data except the 'sites' data and the closing brace are on the first
    //   line;
    // - all data for a key/value pair representing one single site, on a single
    //   line. (See below for example.)
    // This way we can isolate data for one site by performing a grep command,
    // which is much quicker than reading all data into one JSON object. The
    // code is built to keep working if the formatting changes by accident; it
    // will just be much slower. Also, our grep command does not assume that the
    // key for a site is included in double quotes (apparently for fear of
    // having a file in illegal JSON format, which does not double-quote its
    // object keys...) so we may hit false positives.
    // Acquia rules disallow exec() with dynamic arguments.
    // phpcs:disable
    exec(sprintf("grep %s %s --no-filename --color=never --context=0", escapeshellarg($domain), escapeshellarg($location)), $output_array, $exit_code);
    // phpcs:enable
    $result = trim(implode("\n", $output_array));

    if (empty($result)) {
      // Log an explicit fail in APC if we cannot find the domain, so that we
      // can take advantage of APC caching the "fail" also. Differentiate
      // between values for "site not found" and "read failure" so future
      // requests can emit different responses for them. (From the docs about
      // Gnu grep: exit status is 0 if a line is selected -which should never
      // happen here-, 1 if no line is selected, 2 if error encountered.)
      if ($exit_code === 1) {
        $data[$domain] = 0;
      }
    }
    else {
      // $result is in the form of
      // "example.com": {"name": "g123", "flags": {}},
      // (with or without the trailing comma).  Since we didn't include quotes,
      // we may have more than 1 line returned from the grep command, typically
      // if the searched-for site domain is a substring of another site domain.
      // The "m" (multiline) modifier is used in the regular expression so that
      // the begin and end anchors can match the beginning and end of any one of
      // those lines, rather than having to match the entire string from
      // beginning to end (which fails if there is more than 1 line of results).
      $matches = [];
      $pattern = '@^\s*"' . preg_quote($domain, '@') . '": ({.+}),?$@m';
      if (preg_match($pattern, $result, $matches)) {
        $found_site = json_decode($matches[1], TRUE);
      }

      // Retrieve the first line of the JSON file, which contains the global
      // site settings data.
      $f = fopen($location, 'r');
      $json = fgets($f);
      fclose($f);
      $json = rtrim($json, ",\n");
      $json .= "}";
      $global_map_data = json_decode($json, TRUE);

      if (empty($found_site) || empty($global_map_data)) {
        // This will happen if the domain appears in the JSON file, but the
        // format of the file has changed such that the grep-based single-line
        // parsing no longer works.
        if (class_exists('Drupal') && \Drupal::hasService('logger.factory')) {
          \Drupal::logger('acsf')->alert('Unable to extract site data for site @site from sites.json line "@line".', ['@site' => $domain, '@line' => $result]);
        }
        elseif (function_exists('syslog')) {
          syslog(LOG_ERR, sprintf('Unable to extract site data for site %s from sites.json line "%s".', $domain, $result));
        }
        if ($map = gardens_site_data_load_file()) {
          if (!empty($map['sites'][$domain])) {
            $data[$domain] = gardens_site_data_build_data($map['sites'][$domain], $map);
          }
          else {
            // The domain isn't actually present; apparently $domain is a
            // substring of the domain(s) matched by grep. (Or, who knows: the
            // string might appear somewhere else on the line than the 'key'.)
            $data[$domain] = 0;
          }
        }
        // If $data[$domain] was not set here, the file is readable (or there's
        // a race condition and the error just appeared) because we did get a
        // line of data returned earlier. So the JSON is invalid.
      }
      else {
        $data[$domain] = gardens_site_data_build_data($found_site, $global_map_data);
      }
    }

    if (isset($data[$domain])) {
      // Update the current record in place *if* we are using APC.
      if (GARDENS_SITE_DATA_USE_APC) {
        gardens_site_data_cache_set($domain, $data[$domain]);
      }
    }
    else {
      // Report the read failure, only if Drupal is bootstrapped.
      if (function_exists('drupal_register_shutdown_function')) {
        // Since reporting involves contacting the Site Factory it should be
        // done in a way that does not affect pageload.
        drupal_register_shutdown_function('gardens_site_data_json_alert_flag_set');
      }
      // Stop processing further domains.
      break;
    }
  }

  if (count($data) == count($domains)) {
    // No read failure encountered; all domains were accounted for / cached.
    if (gardens_site_data_json_alert_flag_check() && function_exists('drupal_register_shutdown_function')) {
      // Clear the flag. Since it involves contacting the Site Factory it should
      // be done in a way that does not affect pageload.
      drupal_register_shutdown_function('gardens_site_data_json_alert_flag_clear');
    }
  }
  else {
    // If we were checking several domains and any check reported a read failure
    // then don't try reading the file again for other domains; cache the failed
    // domain plus any that were not processed yet, as "read failure". (It's
    // unlikely that we gathered data for some domains before encountering a
    // read failure for another one, but account for it.)
    if (GARDENS_SITE_DATA_USE_APC) {
      foreach ($domains as $domain) {
        if (!isset($data[$domain])) {
          gardens_site_data_cache_set($domain, NULL);
        }
      }
    }
  }

  return $data;
}

/**
 * Returns data for the specified domains using hosting's php interface.
 *
 * @param array $domains
 *   The domain names to look up in the domain registry.
 *
 * @return array
 *   An array keyed by the specified domains, whose values are site data arrays
 *   or 0 if no site was found for the given domain.
 */
function gardens_site_data_from_multi_site_config(array $domains) {
  $data = [];
  $config = Config::getInstance();
  foreach ($domains as $domain) {
    $domain = trim($domain);
    if ($config) {
      // Site config returns an associative array representation of one
      // site object, selected by domain.
      $found_site = $config->siteConfig($domain);
      // Shared config returns an associative array with every key except sites.
      $global_map_data = $config->sharedConfig();
    }
    // In case of missing data, set the results to zero and report the failure.
    if (empty($found_site) || empty($global_map_data)) {
      $data[$domain] = 0;
      if (class_exists('Drupal') && \Drupal::hasService('logger.factory')) {
        \Drupal::logger('acsf')->alert('Unable to extract site data for site @site.', ['@site' => $domain]);
      }
      elseif (function_exists('syslog')) {
        syslog(LOG_ERR, sprintf('Unable to extract data for site %s.', $domain));
      }
    }
    else {
      $data[$domain] = gardens_site_data_build_data($found_site, $global_map_data);
    }
  }
  return $data;
}

/**
 * Stores site info for a given domain in APC.
 *
 * @param string $domain
 *   The domain name used in the cache key to store.
 * @param mixed $data
 *   An array of data about the site/domain containing keys 'dir' and
 *   'gardens_site_settings'. If the domain was not found in the sites.json then
 *   a scalar 0; if sites.json could not be read, then NULL.
 */
function gardens_site_data_cache_set($domain, $data) {
  if (extension_loaded('apcu') && ini_get('apc.enabled') && function_exists('apcu_store')) {
    if ($data === NULL) {
      $ttl = GARDENS_SITE_DATA_READ_FAILURE_TTL;
    }
    elseif ($data === 0) {
      $ttl = GARDENS_SITE_DATA_NOT_FOUND_TTL;
    }
    else {
      $ttl = GARDENS_SITE_DATA_TTL;
    }
    if ($ttl) {
      $domain_key = "gardens_domain:$domain";
      apcu_store($domain_key, $data, $ttl);
    }
  }
}

/**
 * Retrieves cached site info from APC for a given domain.
 *
 * @param string $domain
 *   The domain associated with the cached data.
 *
 * @return mixed
 *   An object containing information about the site on success, or FALSE if no
 *   cached data was found for the domain.
 */
function gardens_site_data_cache_get($domain) {
  $result = FALSE;
  if (extension_loaded('apcu') && ini_get('apc.enabled') && function_exists('apcu_fetch')) {
    $domain_key = "gardens_domain:$domain";
    $result = apcu_fetch($domain_key);
  }
  return $result;
}

/**
 * Re-checks for a fatal issue with the sites.json file.
 *
 * This function is not the only location where issues are determined; it's used
 * to doublecheck the exact type of issue / doublecheck for a race condition,
 * after an issue was initially detected outside this function.
 *
 * @return string
 *   Type of issue encountered. Empty string means the sites.json file is OK
 *   (or is missing, which is also OK).
 */
function gardens_site_data_sites_json_issue_type_get() {
  $issue_type = '';
  $sites_json_path = gardens_site_data_get_filepath();
  // If sites.json is missing completely then this script is being executed
  // outside of an ACSF infrastructure in which case no alert is needed.
  if (file_exists($sites_json_path)) {
    // Check if sites.json is readable.
    if (!is_readable($sites_json_path)) {
      $issue_type = 'file_unreadable';
    }
    // Check if the file's contents are inaccessible.
    if (!$issue_type) {
      // Try to read sites.json and see if it succeeds and what kind of error
      // we get back if it fails. There is a fail which we need to ignore: when
      // the sites.json is being rewritten for a short period of time the
      // following error will be returned:
      //
      // head: cannot open `/mnt/files/balazs.01live/files-private/sites.json'
      // for reading: Structure needs cleaning
      //
      // To make sure we are only triggering an alert in case of a Gluster split
      // brain, redirect the stderr to stdout and look for the indicator
      // message: 'Input/output error'.
      //
      // Acquia rules disallow exec() with dynamic arguments.
      // phpcs:disable
      exec(sprintf('head -n1 %s 2>&1', escapeshellarg($sites_json_path)), $output_array, $exit_code);
      // phpcs:enable
      $output = implode('', $output_array);
      if ($exit_code !== 0 && strpos($output, 'Input/output error') !== FALSE) {
        $issue_type = 'gluster_split_brain';
      }
    }
    // Check for invalid JSON data. We treat empty file as invalid too here,
    // because it doesn't matter much. It's not consistent with the initial
    // check, though. (An empty file does not cause
    // gardens_site_data_json_alert_flag_set() to be called.)
    if (!$issue_type) {
      $map = gardens_site_data_load_file();
      if (!$map) {
        $issue_type = 'invalid_json_data';
      }
    }
  }

  return $issue_type;
}

/**
 * Tries to set a flag, marking that an issue with sites.json exists.
 *
 * This function is not supposed to be used for checking that there is an issue
 * with sites.json; it should only be called if an issue exists.
 *
 * As we do not have a DB connection, and we assume gluster is the primary
 * suspect for issues, the lock will live on the ephemeral disk. If something
 * strange happens while setting the flag (like the file cannot be opened or
 * written to), the function will always return empty string, and no logging/
 * alerting is done at all. We basically have a choice between this and flooding
 * watchdog/syslog/the factory with alerts.
 */
function gardens_site_data_json_alert_flag_set() {
  $lock_file = sprintf(GARDENS_SITE_JSON_ALERT_LOCK_TEMPLATE, $_ENV['AH_SITE_GROUP'], $_ENV['AH_SITE_ENVIRONMENT']);

  if (!file_exists($lock_file)) {
    // Create/open file, do not generate an error in race conditions (two
    // processes opening the file at the same time).
    $fh = fopen($lock_file, 'c');
    if ($fh) {
      // Get (exclusive, non-blocking) lock. Note we assume we can actually rely
      // on flock; see multithreading notes in the php.net docs.
      if (flock($fh, LOCK_EX | LOCK_NB)) {
        // Something more evasive than the 'fopen()' race condition: what
        // happens just around the time a sites.json issue stops existing? Could
        // one slow process that still thinks there is an issue, be delayed and
        // execute this code just _after_ another process removed the flag? That
        // would result in a superfluous alert being sent out at that time. To
        // prevent this, we repeat the check. (We often would need to do this
        // check anyway, somewhere, if we did not know the issue type yet.)
        $issue_type = gardens_site_data_sites_json_issue_type_get();

        // Send the alert to the Site Factory.
        $alert_sent = FALSE;
        if ($issue_type) {
          $response = gardens_site_data_alert_send('sites_json', $issue_type);
          if ($response->code == 200 && !empty($response->body['received'])) {
            $alert_sent = TRUE;
          }
        }

        // Remove the lock file if issue has gone away or the alert was not
        // processed by the Site Factory.
        if (!$alert_sent) {
          // Remove the lock file (name; the file/handle itself is still
          // locked/open, which is fine).
          unlink($lock_file);
        }

        // Release the lock.
        flock($fh, LOCK_UN);
      }
      fclose($fh);
    }
  }
}

/**
 * Checks if a 'sites.json alert' flag exists.
 *
 * @return bool
 *   TRUE on if the flag exists.
 */
function gardens_site_data_json_alert_flag_check() {
  $lock_file = sprintf(GARDENS_SITE_JSON_ALERT_LOCK_TEMPLATE, $_ENV['AH_SITE_GROUP'], $_ENV['AH_SITE_ENVIRONMENT']);
  return file_exists($lock_file);
}

/**
 * Clears a 'sites.json alert' flag.
 */
function gardens_site_data_json_alert_flag_clear() {
  $lock_file = sprintf(GARDENS_SITE_JSON_ALERT_LOCK_TEMPLATE, $_ENV['AH_SITE_GROUP'], $_ENV['AH_SITE_ENVIRONMENT']);

  if (file_exists($lock_file)) {
    // To prevent a situation where a slow process would remove the file just
    // after it was created (i.e. the reverse of what is documented in
    // gardens_site_data_json_alert_flag_set()), we lock the file and check
    // again, and only remove the file if no issues were encountered. This isn't
    // exactly symmetric in the sense that we have no domain name, so: if domain
    // specific information was just lost somehow, then a slow process has a
    // higher chance of clearing the flag when it shouldn't. The effect: two
    // alerts would be sent out in sequence (because the flag is set, cleared
    // here, and then set again). That is less problematic than the reverse,
    // which would send out an alert at the moment the domain specific error was
    // just solved.
    $fh = @fopen($lock_file, 'r+');
    if ($fh) {
      if (flock($fh, LOCK_EX | LOCK_NB)) {
        // Make sure that the issue is gone.
        $issue_type = gardens_site_data_sites_json_issue_type_get();

        // Send an all fine message to the Site Factory if the issue is gone.
        $alert_sent = FALSE;
        if (!$issue_type) {
          $response = gardens_site_data_alert_send('sites_json', 'all_fine');
          if ($response->code == 200 && !empty($response->body['received'])) {
            $alert_sent = TRUE;
          }
        }

        // Clear the flag if the all fine message was sent and processed.
        if ($alert_sent) {
          // There is no problem with unlinking a locked file; the file name
          // gets freed up (while the 'orphaned' file itself is still locked).
          // Removing a (locked) file like this does not introduce a race
          // condition, if all processes try to lock the file in an exclusive
          // and non-blocking manner. So unlinking the file should never fail.
          // If it does, we could try to log to watchdog/syslog but that would
          // completely flood the logs.
          @unlink($lock_file);
        }
        // We could release the lock here but if the file is already unlinked
        // that won't do much useful - and if it's not, we may be better off
        // keeping it locked.
      }
      fclose($fh);
    }
  }
}

/**
 * Returns the shared credentials.
 *
 * @param string $site
 *   The hosting sitegroup name.
 * @param string $env
 *   The hosting environment name.
 *
 * @return Acquia\SimpleRest\SimpleRestCreds
 *   The credentials.
 *
 * @throws Exception
 *   If the credentials cannot be read for any reason.
 */
function gardens_site_data_shared_creds_get($site, $env) {
  $ini_file = sprintf('/mnt/files/%s.%s/nobackup/sf_shared_creds.ini', $site, $env);
  if (file_exists($ini_file)) {
    $data = parse_ini_file($ini_file, TRUE);
    if (!empty($data) && !empty($data['gardener'])) {
      return new SimpleRestCreds($data['gardener']['username'],
        $data['gardener']['password'],
        $data['gardener']['url']);
    }
  }
  throw new Exception(sprintf('Unable to read credentials from %s.', $ini_file));
}

/**
 * Alerts the Site Factory on possible sites.json issues.
 *
 * @param string $scope
 *   The scope type. (Currently only 'sites_json' scope type is accepted by the
 *   Site Factory.)
 * @param string $issue_type
 *   The issue type.
 *
 * @return Acquia\SimpleRest\SimpleRestResponse
 *   The response.
 */
function gardens_site_data_alert_send($scope, $issue_type) {
  // The SF REST API endpoint.
  $endpoint = 'site-api/v1/sf-alert';
  // The hosting site group name.
  $site = $_ENV['AH_SITE_GROUP'];
  // The hosting environment name.
  $env = $_ENV['AH_SITE_ENVIRONMENT'];
  // The fully qualified webnode name.
  $webnode = gethostname();

  try {
    $parameters = [
      'scope' => $scope,
      'data' => [
        'issue_type' => $issue_type,
        'site_group' => $site,
        'site_env' => $env,
        'server' => $webnode,
        // Instead of \Drupal::time()->getRequestTime() we're going to use
        // time() here because there is no definite usage of \Drupal at this
        // point in the bootstrap.
        // Rest of the code above also does a class_exists() check against
        // 'Drupal', probably due to the same reason.
        'timestamp' => time(),
      ],
    ];
    $creds = gardens_site_data_shared_creds_get($site, $env);
    $message = new SimpleRestMessage($site, $env);
    $response = $message->send('POST', $endpoint, $parameters, $creds);
  }
  catch (Exception $e) {
    $error_message = sprintf('Sending alert to Site Factory failed: %s', $e->getMessage());
    syslog(LOG_ERR, $error_message);
    $response = new SimpleRestResponse($endpoint, 500, ['message' => $error_message]);
  }

  return $response;
}
