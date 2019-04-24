<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Commands for installing the CancerGov site sections.
 */
class SiteSectionsCommand extends BltTasks {

  /**
   * Define the cgov:install namespace.
   *
   * @hidden
   * @command cgov:install
   */
  public function install() {
    /* Placeholder method to define the cgov:install namespace. */
  }

  /**
   * Install site sections.
   *
   * @command cgov:install:site-sections
   */
  public function siteSections() {
    $commands = [
      'cgov:enable-module' => ['moduleName' => 'cgov_migration'],
    ];
    $this->invokeCommands($commands);

    $task = $this->taskDrush()
      ->drush('mim')
      ->rawArg('rawhtmlblock_migration')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();

    $task = $this->taskDrush()
      ->drush('mim')
      ->rawArg('sitesectionsql_migration')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
