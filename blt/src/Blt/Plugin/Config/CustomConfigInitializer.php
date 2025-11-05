<?php

namespace Cgov\Blt\Plugin\Config;

use Acquia\Blt\Robo\Config\ConfigInitializer;

/**
 * Custom configuration initializer.
 *
 * This class extends BLT's ConfigInitializer to provide custom environment
 * detection logic that handles MEO environments
 * by prefixing environment names with 'meo' when appropriate.
 */
class CustomConfigInitializer extends ConfigInitializer {

  /**
   * {@inheritdoc}
   *
   * Override environment determination to handle MEO environments.
   * When AH_ENVIRONMENT_TYPE=meo, prefix the environment with 'meo'.
   */
  public function determineEnvironment() {
    // First check for explicit environment parameters.
    $environment = parent::determineEnvironment();

    // If we got a specific environment from parent, use it.
    if ($environment !== 'local' || !getenv('AH_SITE_ENVIRONMENT')) {
      return $environment;
    }

    // We're in an Acquia environment, check if it's MEO.
    $ah_environment_type = getenv('AH_ENVIRONMENT_TYPE');
    $ah_site_environment = getenv('AH_SITE_ENVIRONMENT');

    if ($ah_environment_type === 'meo' && $ah_site_environment) {
      // For MEO environments, prefix with 'meo'.
      return 'meo' . $ah_site_environment;
    }
    elseif ($ah_site_environment) {
      // For ACE environments, use the environment as-is.
      return $ah_site_environment;
    }

    // Fallback to parent logic.
    return $environment;
  }

}
