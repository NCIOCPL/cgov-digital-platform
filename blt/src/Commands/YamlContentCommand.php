<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Handle importing default yaml content.
 *
 * Future iterations should allow for command line
 * specification of the specific module to install.
 */
class YamlContentCommand extends BltTasks {

  /**
   * Enable and install yaml content from custom module.
   *
   * @command custom:install_default_yaml_content
   */
  public function installDefaultYamlContent() {
    $commands = [
      'custom:enable_custom_yaml_content',
      'custom:import_custom_yaml_content',
    ];
    $this->invokeCommands($commands);
  }

  /**
   * Enable custom yaml content module.
   *
   * @command custom:enable_custom_yaml_content
   */
  public function enableCustomYamlContent() {
    $this->say("Installing cgov_yaml_content module!");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $task = $this->taskDrush()
      ->drush('en')
      ->rawArg('cgov_yaml_content')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

  /**
   * Import default yaml content from module.
   *
   * @command custom:import_custom_yaml_content
   * @description Do the thing.
   */
  public function importCustomYamlContent() {
    $this->say("Importing cgov_yaml_content module default content!");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $task = $this->taskDrush()
      ->drush('ycim')
      ->rawArg('cgov_yaml_content')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
