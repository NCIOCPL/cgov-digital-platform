<?php

namespace Cgov\Blt\Plugin\Commands\Tests;

use Acquia\Blt\Robo\Commands\Tests\DrupalCheckCommand;

/**
 * Defines additional commands in the "tests:validation:*" namespace.
 */
class ProfileDrupalCheckCommand extends DrupalCheckCommand {

  /**
   * Executes the deprecation-validate command.
   *
   * @command tests:deprecated:profiles
   */
  public function validateDeprecatedProfiles() {
    $this->runDrupalCheck('profiles');
  }

}
