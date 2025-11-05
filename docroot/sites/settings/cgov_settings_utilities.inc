<?php

/**
 * @file
 * Cgov utility functions for use throughout the *.settings.php files
 *
 * Make sure to use require_once() so this file is never loaded more than
 * once per page.
 */

 // Whenever BLT goes away, this is replaced by
 // Acquia\Drupal\RecommendedSettings\Helpers\EnvironmentDetector;
 use Acquia\Blt\Robo\Common\EnvironmentDetector;

class CGovSettingsUtil {

  /**
   * Determines whether we are on an Acquia environment.
   *
   * @return bool
   *   True if this is an Acquia environment (MEO or ACE)
   */
  public static function isAcquia() {
    return (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT']));
  }

  /**
   * Returns the current environment name for use in determining settings.
   *
   * @return string
   *   The environments name
   */
  public static function getEnvironmentName() {
    if (self::isAcquia()) {
      $env = $_ENV['AH_SITE_ENVIRONMENT'];
      if (preg_match('/^ode\d*$/', $env)) {
        $env = 'ode';
      }
    }
    else {
      $env = 'local';
    }
    return $env;
  }

  /**
   * Returns the current domain name for use in settings.
   *
   * @return string
   *   The primary domain name
   */
  public static function getDomain() {
    // Default our domain to PROD.
    $domain = 'www.cancer.gov';

    // Check if this is an MEO site first.
    if ($_ENV['AH_ENVIRONMENT_TYPE'] === 'meo') {
      // Load the CDP mapping file to determine which MEO site we are on.
      $cdp_mapping_path = "/mnt/files/{$_ENV['AH_SITE_GROUP']}.{$_ENV['AH_SITE_ENVIRONMENT']}/cgdp/sites.php";
      if (!is_file($cdp_mapping_path)) {
        error_log("MEO CDP mapping file not found: $cdp_mapping_path.");
      }
      else {
        require $cdp_mapping_path;

        // Check if the site name exists in the mapping file.
        if (!isset($cgdpUrls) || !isset($_ENV['AH_DRUPAL_SITE_NAME']) || !isset($cgdpUrls[$_ENV['AH_DRUPAL_SITE_NAME']])) {
          error_log("Site name '{$_ENV['AH_DRUPAL_SITE_NAME']}' not found in CDP mapping file.");
        }
        else {
          $domain = $cgdpUrls[$_ENV['AH_DRUPAL_SITE_NAME']];
        }
      }
    }
    else {
      // For non-MEO sites, the domain depends on the environment name.
      $env = self::getEnvironmentName();
      switch ($env) {
        case 'local':
          $domain = 'www.devbox';
          break;

        case 'ode':
          $domain = 'ncigovcd' . $_ENV['AH_SITE_ENVIRONMENT'] . '.prod.acquia-sites.com';
          break;

        // Other AC environments have a standard domain format.
        default:
          $domain = 'www-' . $env . '-ac.cancer.gov';
          break;
      }
    }
    return $domain;
  }

}
