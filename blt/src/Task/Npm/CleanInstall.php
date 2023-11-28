<?php

namespace Cgov\Task\Npm;

use Robo\Task\Npm\Install;

/**
 * Implementation of the 'npm ci' command missing from the built-in npm tasks.
 *
 * @package Cgov\Task\Npm
 */
class CleanInstall extends Install {

  /**
   * Override the Install command's 'install' with ci (clean-install).
   *
   * @var string
   */
  protected $action = "ci";

}
