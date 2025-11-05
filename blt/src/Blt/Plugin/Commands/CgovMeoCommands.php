<?php

namespace Cgov\Blt\Plugin\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Commands for use in the MEO Environments.
 *
 * Some of the MEO deployment tasks require specific handling. (I am
 * looking at you post-install) So for consistency, we will define all
 * cgov MEO hook methods here.
 */
class CgovMeoCommands extends BltTasks {

  /**
   * Post Install Support for MEO.
   *
   * @command cgov:meo:post-install
   *
   * @validateDrushConfig
   * @executeInVm
   */
  public function postInstall() {
    $commands = [
      'cgov:locales:translate' => [],
      'cgov:user:load-all' => [],
    ];

    $this->invokeCommands($commands);
  }

  /**
   * DB Update Support for MEO.
   *
   * @command cgov:meo:db-update
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
   * Post staging deploy support for MEO.
   *
   * @command cgov:meo:post-staging-deploy
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
   * @command cgov:meo:block-admin
   */
  public function blockAdminUser() {
    $task = $this->taskDrush()
      ->drush('block-admin-user')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
