<?php

namespace Drupal\cgov_core;

/**
 * All available environment (tier) variables for Cgov Site Environments.
 *
 * @package Drupal\cgov_core
 */
final class CgovEnvironments {

  /**
   * The PROD environment.
   */
  const PROD = 'prod';

  /**
   * The test environment.
   */
  const TEST = 'test';

  /**
   * The dev/int environment.
   */
  const DEV = 'dev';

  /**
   * A local environment.
   */
  const LOCAL = 'local';

}
