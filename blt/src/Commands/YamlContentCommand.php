<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Handle importing default yaml content.
 */
class YamlContentCommand extends BltTasks {

  /**
   * Enable and install yaml content from custom module.
   *
   * Pass the name of the module contain default yaml content.
   * Eg, "blt custom:instal_default_yaml_content cgov_yaml_content".
   *
   * @param string $module
   *   Name of module with yaml content.
   *
   * @command custom:install_default_yaml_content
   */
  public function installDefaultYamlContent($module) {
    $commands = [
      'custom:enable_custom_yaml_content' => ['module' => $module],
      'custom:import_custom_yaml_content' => ['module' => $module],
    ];
    $this->invokeCommands($commands);
  }

  /**
   * Enable custom yaml content module.
   *
   * @param string $module
   *   Name of module to enable.
   *
   * @command custom:enable_custom_yaml_content
   */
  public function enableCustomYamlContent($module) {
    $this->say("************************************************");
    $this->say("***** Installing $module module! *****");
    $this->say("************************************************");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $task = $this->taskDrush()
      ->drush('en')
      ->rawArg($module)
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

  /**
   * Import default yaml content from module.
   *
   * @param string $module
   *   Name of module to import from.
   *
   * @command custom:import_custom_yaml_content
   */
  public function importCustomYamlContent($module) {
    $this->say("***************************************************************");
    $this->say("***** Importing $module module default content! *****");
    $this->say("***************************************************************");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $task = $this->taskDrush()
      ->drush('ycim')
      ->rawArg($module)
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
