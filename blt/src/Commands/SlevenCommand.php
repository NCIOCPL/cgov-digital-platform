<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * A library of convenience commands.
 */
class SlevenCommand extends BltTasks {

  /**
   * Reinstalls a web site.
   *
   * @command cgov:reinstall
   */
  public function reinstall() {

    $commands = [
      'drupal:install' => [],
      'drupal:toggle:modules' => [],
      'cgov:user:load-all' => [],
      'cgov:locales:translate' => [],
      'custom:install_cgov_yaml_content_by_module' => [
        'module' => 'cgov_yaml_content',
      ],
    ];

    $this->invokeCommands($commands);
  }

  /**
   * Rebuilds the front-end and only the front-end.
   *
   * This does not drush cr as you might do it without
   * a site installed.
   *
   * @command cgov:rebuild-feq
   */
  public function rebuildfeq() {

    $commands = [
      'source:build:frontend' => [],
    ];

    $this->invokeCommands($commands);
  }

  /**
   * Utility method to enable the named module.
   *
   * This is an alternative to duplicating the taskDrush() call.
   *
   * @command cgov:enable-module
   */
  public function enableModule($moduleName) {
    $this->say("enabling $moduleName");
    $task = $this->taskDrush()
      ->drush('en')
      ->rawArg($moduleName)
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

  /**
   * Rebuild Drupal Cache.
   *
   * @command cgov:cache-rebuild
   */
  public function cacheRebuild() {
    $this->say("Clearing Cache");
    $task = $this->taskDrush()
      ->drush('cr')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
