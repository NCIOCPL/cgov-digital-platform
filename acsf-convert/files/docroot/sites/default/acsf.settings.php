<?php

/**
 * @file
 * ACSF business logic to catch mistyped domains arriving to the infrastructure.
 *
 * This file must not be modified. For a customized response / "site not found"
 * page, change sites/default/settings.php instead (above the line that says
 * "===== Added by acsf-init") and copy the below logic in there if necessary.
 */

// Only execute the ACSF specific code when it is run on an ACSF infrastructure.
// The sites.inc should have these variables populated when on ACSF.
if (!empty($_ENV['AH_SITE_GROUP']) && !empty($_ENV['AH_SITE_ENVIRONMENT']) && function_exists('gardens_site_data_get_filepath') && file_exists(gardens_site_data_get_filepath())) {

  // A user who gets here is trying to visit a site that is not yet registered
  // with either the Site Factory or Hosting.
  // Don't run any of this code if we are drush or a CLI script.
  if (function_exists('drush_main') || PHP_SAPI === 'cli') {
    if (!function_exists('drush_main')) {
      header($_SERVER['SERVER_PROTOCOL'] . ' 404 Not Found');
    }
    return 'acsf-infrastructure';
  }

  // Print a 404 response and a small HTML page.
  header("HTTP/1.0 404 Not Found");
  header('Content-type: text/html; charset=utf-8');
  if (!empty($GLOBALS['gardens_site_settings']['page_ttl'])
    && is_numeric($GLOBALS['gardens_site_settings']['page_ttl'])
    && $GLOBALS['gardens_site_settings']['page_ttl'] > 0) {
    // Set alternative Cache-Control header. The other header is required
    // because Acquia's Varnish will not allow max-age < 900 without it.
    header("Cache-Control: max-age={$GLOBALS['gardens_site_settings']['page_ttl']}, public");
    header('X-Acquia-No-301-404-Caching-Enforcement: 1');
  }

  print <<<HTML
<!DOCTYPE html>
<html>
 <head>
  <meta charset="UTF-8" />
  <title>404 Page Not Found</title>
  <meta name="robots" content="noindex, nofollow, noarchive" />
 </head>
 <body>
  <p>The site you are looking for could not be found.</p>
 </body>
</html>
HTML;

  exit();
}
