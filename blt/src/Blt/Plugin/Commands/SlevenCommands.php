<?php

namespace Cgov\Blt\Plugin\Commands;

use Acquia\Blt\Robo\BltTasks;
use Acquia\Blt\Robo\Exceptions\BltException;

/**
 * A library of convenience commands.
 */
class SlevenCommands extends BltTasks {

  /**
   * Reinstalls a web site.
   *
   * @command cgov:reinstall
   */
  public function reinstall() {

    $commands = [
      'drupal:install' => [],
      'cgov:user:load-all' => [],
      'cgov:locales:translate' => [],
      'custom:install_cgov_yaml_content_by_module' => [
        'module' => 'cgov_yaml_content',
      ],
      'cgov:load-fe-globals' => [],
    ];

    $this->invokeCommands($commands);
  }

  /**
   * Loads the front-enf globals.
   *
   * @command cgov:load-fe-globals
   */
  public function loadFrontendGlobals() {
    // Read the config.
    $front_end_globals_path = $this->getConfigValue('cgov.front_end_globals_file');

    if (!file_exists($front_end_globals_path)) {
      throw new BltException("Could not read the front-end globals config.");
    }

    // Parse the JSON.
    $configArr = json_decode(
      file_get_contents($front_end_globals_path),
      TRUE
    );

    // Re-encode it to remove newlines.
    $configStr = json_encode($configArr, JSON_FORCE_OBJECT);

    // Call drush with json.
    $task = $this->taskDrush()
      ->drush('config:set')
      ->rawArg('cgov_core.frontend_globals')
      ->rawArg('config_object')
      ->rawArg("'" . $configStr . "'")
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
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
