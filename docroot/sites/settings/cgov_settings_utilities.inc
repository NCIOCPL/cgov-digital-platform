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
   *   True if this is an Acquia environment (ACSF or AC)
   */
  public static function isAcquia() {
    return (file_exists('/var/www/site-php') && isset($_ENV['AH_SITE_ENVIRONMENT']));
  }

  /**
   * Determines whether we are on an ACSF environment.
   *
   * @return bool
   *   True if this is an ACSF environment
   */
  public static function isACSF() {
    $is_acsf_env = EnvironmentDetector::isAcsfEnv();
    $acsf_db_name = EnvironmentDetector::getAcsfDbName();
    return ($is_acsf_env && $acsf_db_name);
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
    } else {
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
    // Check if this is an ACSF site first.
    if (self::isACSF()) {
      $domains = gardens_data_get_sites_from_file($GLOBALS['gardens_site_settings']['conf']['acsf_db_name']);
      // You should always add the public domain first domain when creating a site,
      // but just in case we will set to the default first.
      $domain = array_keys($domains)[0];
      foreach ($domains as $site_name => $site_info) {
        if (!empty($site_info['flags']['preferred_domain'])) {
          $domain = $site_name;
        }
      }
    // For non-ACSF sites, the domain depends on the environment name.
    } else {
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


