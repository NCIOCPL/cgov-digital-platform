<?php

namespace Cgov\Blt\Plugin\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Handle importing default yaml content.
 */
class YamlContentCommands extends BltTasks {

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
      'cgov:install:site-sections' => [],
      'cgov:enable-module' => ['moduleName' => $module],
      'custom:import_cgov_yaml_content' => ['module' => $module],
    ];
    $this->invokeCommands($commands);
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
