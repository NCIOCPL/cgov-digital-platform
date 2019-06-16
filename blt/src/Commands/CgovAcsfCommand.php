<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Commands for use in the ACSF Environments.
 *
 * Some of the Factory Hooks are a pain to run multiple commands. (I am
 * looking at you post-install) So for consistency, we will define all
 * cgov factory hook methods here.
 */
class CgovAcsfCommand extends BltTasks {

  /**
   * Post Install Support for ACSF.
   *
   * @command cgov:acsf:post-install
   *
   * @validateDrushConfig
   * @executeInVm
   */
  public function postInstall() {
    $commands = [
      'cgov:locales:translate' => [],
      'cgov:acsf:block-admin' => [],
      'cgov:user:load-all' => [],
    ];

    $this->invokeCommands($commands);
  }

  /**
   * DB Update Support for ACSF.
   *
   * @command cgov:acsf:db-update
   *
   * @validateDrushConfig
   * @executeInVm
   */
  public function dbUpdate() {
    $commands = [
      'cgov:locales:translate' => [],
    ];

    $this->invokeCommands($commands);
  }

  /**
   * Post staging deploy support for ACSF.
   *
   * @command cgov:acsf:post-staging-deploy
   *
   * @validateDrushConfig
   * @executeInVm
   */
  public function postStagingDeploy() {
    $commands = [];

    $this->invokeCommands($commands);
  }

  /**
   * Blocks the admin user from being able to login.
   *
   * @command cgov:acsf:block-admin
   */
  public function blockAdminUser() {
    $task = $this->taskDrush()
      ->drush('block-admin-user')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
