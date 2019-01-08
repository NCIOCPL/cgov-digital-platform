<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Handle importing default yaml content.
 */
class YamlContentCommand extends BltTasks {

  /**
   * Enable and install yaml content from a cgov custom module.
   *
   * Pass the name of the module containinng default yaml content.
   * Eg, "blt custom:install_default_yaml_content cgov_yaml_content".
   *
   * NOTE: If you're content failts to load, ensure it accords with the
   * yaml_content module requirements (namely, nesting content.yml files
   * in a content directory).
   *
   * @param string $module
   *   Name of module with yaml content.
   *
   * @command custom:install_cgov_yaml_content_by_module
   */
  public function installCgovYamlContentByModule($module) {
    $commands = [
      'custom:enable_cgov_yaml_content' => ['module' => $module],
      'custom:import_cgov_yaml_content' => ['module' => $module],
    ];
    $this->invokeCommands($commands);
  }

  /**
   * Enable Cgov yaml content module.
   *
   * @param string $module
   *   Name of module to enable.
   *
   * @command custom:enable_cgov_yaml_content
   */
  public function enableCgovYamlContent($module) {
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
   * Import default yaml content from Cgov module.
   *
   * @param string $module
   *   Name of module to import from.
   *
   * @command custom:import_cgov_yaml_content
   */
  public function importCgovYamlContent($module) {
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
