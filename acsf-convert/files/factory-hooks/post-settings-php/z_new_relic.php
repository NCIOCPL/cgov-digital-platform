<?php
/**
 * This hook provides the correct hostname for the site that
 * we are viewing. This should help to break up the CMS sites
 * from the live web sites. NOTE: This will lump all path-based
 * microsites into the root hostname. (e.g. nano will be www)
 *
 * Assumption is that if we are running this hook we must
 * be in ACSF.
 */
if (extension_loaded('newrelic')) {
   $domain_fragments = explode('.', $_SERVER['HTTP_HOST']);
   $site_name = array_shift($domain_fragments);
   // Existing New Relic App Name.
   $env = $_ENV['AH_SITE_ENVIRONMENT'];
   $ah_group = $_ENV['AH_SITE_GROUP'];
   $app_name = $ah_group . "." . $env;
   newrelic_set_appname("$site_name;$app_name", '', 'true');
}
