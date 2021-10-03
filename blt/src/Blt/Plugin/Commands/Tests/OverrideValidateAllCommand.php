<?php

namespace Cgov\Blt\Plugin\Commands\Tests;

use Acquia\Blt\Robo\Commands\Tests\ValidateAllCommand;

/**
 * Overrides commands in the "validate:all*" namespace.
 */
class OverrideValidateAllCommand extends ValidateAllCommand {

  /**
   * Runs all code validation commands.
   *
   * @hook replace-command validate
   * @aliases validate:all
   * @hidden
   */
  public function all() {
    $parent_status_code = parent::all();

    // To enable this command, set to TRUE in blt.yml.
    if ($this->getConfigValue('validate.deprecation') == TRUE) {
      $commands[] = 'tests:deprecated';
    }

    $status_code = $this->invokeCommands($commands);
    return $status_code + $parent_status_code;
  }

}
