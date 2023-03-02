<?php

namespace Cgov\Blt\Plugin\Commands;

use Acquia\Blt\Robo\BltTasks;
use Acquia\Blt\Robo\Exceptions\BltException;

/**
 * Defines commands in the "drupal:toggle:modules" namespace.
 */
class ToggleModulesCommand extends BltTasks {

  /**
   * Enables and uninstalls specified modules.
   *
   * You may define the environment for which modules should be toggled by
   * passing the --environment=[value] option to this command, setting the
   * 'environnment' environment variable, or defining environment in one of your
   * BLT configuration files.
   *
   * @command drupal:toggle:modules
   *
   * @aliases dtm toggle setup:toggle-modules
   *
   * @validateDrushConfig
   */
  public function toggleModules() {
    if ($this->getConfig()->has('environment')) {
      $environment = $this->getConfigValue('environment');
    }

    if (isset($environment)) {
      // Enable modules.
      $enable_key = "modules.$environment.enable";
      $this->doToggleModules('pm-enable', $enable_key);

      // Uninstall modules.
      $disable_key = "modules.$environment.uninstall";
      $this->doToggleModules('pm-uninstall', $disable_key);
    }
    else {
      $this->say("Environment is unset. Skipping drupal:toggle:modules...");
    }
  }

  /**
   * Enables or uninstalls an array of modules.
   *
   * @param string $command
   *   The drush command to execute, e.g., pm-enable or pm-uninstall.
   * @param string $config_key
   *   The config key containing the array of modules.
   *
   * @throws \Acquia\Blt\Robo\Exceptions\BltException
   */
  protected function doToggleModules($command, $config_key) {
    $installed_modules = $this->getInstalledModules();

    if ($this->getConfig()->has($config_key)) {
      $this->say("Executing <comment>drush $command</comment> for modules defined in <comment>$config_key</comment>...");
      $modules = (array) $this->getConfigValue($config_key);
      $filtered_list = array_filter(
        $modules,
        function ($module) use ($command, $installed_modules) {
          switch ($command) {
            case "pm-enable":
              // We should only enable modules not currently enabled.
              return !in_array($module, $installed_modules);

            case "pm-uninstall":
              // We should only return the module if it is enabled.
              return in_array($module, $installed_modules);

            default:
              return FALSE;
          }
        }
      );

      if (count($filtered_list) > 0) {
        $modules_list = implode(' ', $filtered_list);
        $result = $this->taskDrush()
          ->drush("$command $modules_list")
          ->run();
        $exit_code = $result->getExitCode();
      }
      else {
        switch ($command) {
          case "pm-enable":
            // We should only enable modules not currently enabled.
            $this->say("There are no modules to enable.");
            break;

          case "pm-uninstall":
            // We should only return the module if it is enabled.
            $this->say("There are no modules to disable.");
            break;

          default:
            $this->say("Unknown module toggle command.");
        }
        $exit_code = 0;
        return;
      }
    }
    else {
      $exit_code = 0;
      $this->logger->info("$config_key is not set.");
    }

    if ($exit_code) {
      throw new BltException("Could not toggle modules listed in $config_key.");
    }
  }

  /**
   * Gets the list of installed modules.
   *
   * @return array
   *   The list of installed modules.
   */
  protected function getInstalledModules() {
    $result = $this->taskDrush()
      ->drush("pm-list")
      ->option("status", "enabled")
      ->option("fields", "name")
      ->option("format", "list")
      ->printOutput(FALSE)
      ->run();

    $exit_code = $result->getExitCode();

    if ($exit_code === 0) {
      return preg_split(
        "/\R+/",
        $result->getMessage(),
        -1,
        PREG_SPLIT_NO_EMPTY
      );
    }
    else {
      throw new BltException("Could not get modules list.");
    }
  }

  /*
   * These next two groups were borrowed from
   * https://github.com/shelane/toggle-modules.
   * They allow toggle:modules to run in the original, locations without
   * having to hack up drupal:config:import or drupal:toggle:modules.
   *
   * Although we have hacked up our own copy of drupal:config:import to
   * keep Features support in BLT.
   */

  /**
   * This will be called after the config import.
   *
   * @hook post-command drupal:config:import
   */
  public function importToggle() {
    $this->invokeCommand('drupal:toggle:modules');
  }

  /**
   * This will be called after the setup build.
   *
   * @hook post-command drupal:install
   */
  public function setupToggle() {
    $this->invokeCommand('drupal:toggle:modules');
  }

}
