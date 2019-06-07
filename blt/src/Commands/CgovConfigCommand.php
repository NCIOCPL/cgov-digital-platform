<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\Exceptions\BltException;
use Acquia\Blt\Robo\Commands\Setup\ConfigCommand;

/**
 * Defines commands in the "cgov" namespace.
 */
class CgovConfigCommand extends ConfigCommand {

  /**
   * Imports configuration for the cgov platform.
   *
   * @hook replace-command drupal:config:import
   *
   * @validateDrushConfig
   * @executeInVm
   */
  public function import() {
    $strategy = $this->getConfigValue('cm.strategy');

    if ($strategy != 'none') {
      $cm_core_key = $this->getConfigValue('cm.core.key');
      $this->logConfig($this->getConfigValue('cm'), 'cm');
      $task = $this->taskDrush();

      $this->invokeHook('pre-config-import');

      // If exported site UUID does not match site active site UUID, set active
      // to equal exported.
      // @see https://www.drupal.org/project/drupal/issues/1613424
      $exported_site_uuid = $this->getExportedSiteUuid($cm_core_key);
      if ($exported_site_uuid) {
        $task->drush("config:set system.site uuid $exported_site_uuid");
      }

      if ($strategy == 'features') {
        $this->importFeatures($task, $cm_core_key);
      }
      else {
        // Do nothing.
      }

      $task->drush("cache-rebuild");
      $result = $task->run();
      if (!$result->wasSuccessful()) {
        throw new BltException("Failed to import configuration!");
      }

      $this->checkFeaturesOverrides($cm_core_key);

      $result = $this->invokeHook('post-config-import');

      return $result;
    }
  }

  /**
   * Checks whether features are overridden.
   *
   * @command cgov:config:features:validate
   *
   * @throws \Exception
   *   If cm.features.no-overrides is true, and there are features overrides
   *   an exception will be thrown.
   */
  public function checkFeaturesOverrides() {
    if (!$this->getConfigValue('cm.features.allow-overrides')) {
      // @codingStandardsIgnoreStart
      $this->say("Checking for features overrides...");
      if ($this->getConfig()->has('cm.features.bundle')) {
        $task = $this->taskDrush()->stopOnFail();
        foreach ($this->getConfigValue('cm.features.bundle') as $bundle) {
          $task->drush("fl")
            ->option('bundle', $bundle);
          // TODO: Figure out a way to run the alter before printing it out.
          // This will help avoid confusing people in the future.
          $result = $task->printOutput(TRUE)->run();

          if (!$result->wasSuccessful()) {
            throw new BltException("Unable to determine if features in bundle $bundle are overridden.");
          }

          $output = $result->getMessage();
          $output = $this->alterFeaturesOutput($output);
          $features_overridden = preg_match('/(changed|conflicts|added)/', strtolower($output));
          if ($features_overridden) {
            throw new BltException("A feature in the $bundle bundle is overridden. You must re-export this feature to incorporate the changes.");
          }
        }
      }
    }
    // @codingStandardsIgnoreEnd
  }

  /**
   * Remove any features which are not managed by cgov.
   */
  protected function alterFeaturesOutput($json_arr) {
    $json_file = json_decode($json_arr);
    $new_json = [];
    if (!empty($json_file)) {
      foreach ($json_file as $key => $value) {
        if (strpos($key, 'cgov_') === 0 || strpos($key, 'pdq_') === 0) {
          $new_json[$key] = $value;
        }
      }
    }
    return json_encode($new_json);
  }

}
