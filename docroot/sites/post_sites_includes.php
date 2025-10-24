<?php

/**
 * @file
 * MEO post-sites-php include file.
 */

// The function_exists check is required as the file is included several times.
if (!function_exists('meo_get_site_domains')) {

  /**
   * Get the domains for the site.
   *
   * @return array
   *   An array containing the site's domain information.
   */
  function meo_get_site_domains() {
    // For MEO single-site, we can get the domain from the settings.
    $domain = !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'default';
    return [
      $domain => [
        'name' => basename(DRUPAL_ROOT),
      ],
    ];
  }

}

// Get the domains for the current site.
$domains = meo_get_site_domains();
