<?php

namespace Cgov\Blt\Plugin\Commands;

use Acquia\Blt\Robo\Blt;
use Acquia\Blt\Robo\Exceptions\BltException;
use Acquia\Blt\Robo\Commands\Drupal\ConfigCommand;
use Acquia\Blt\Robo\Common\UserConfig;
use Zumba\Amplitude\Amplitude;

/**
 * Defines commands in the "cgov" namespace.
 */
class CgovConfigCommands extends ConfigCommand {

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

    $userConfig = new UserConfig(Blt::configDir());
    $eventInfo = $userConfig->getTelemetryUserData();
    $eventInfo['strategy'] = $strategy;
    Amplitude::getInstance()->queueEvent('config import', $eventInfo);

    if ($strategy == 'none') {
      // Still clear caches to regenerate frontend assets and such.
      $result = $this->taskDrush()->drush("cache-rebuild")->run();
      return $result;
    }

    // The config setting was removed in BLT 12, and this is what the
    // BLT code hard codes it to. We have not overwritten that key,
    // and this is the value of the old build.yml. It must be set to
    // something since it is now gone.
    $cm_core_key = 'sync';
    $this->logConfig($this->getConfigValue('cm'), 'cm');
    $task = $this->taskDrush();

    $this->invokeHook('pre-config-import');

    // If using core-only or config-split strategies, first check to see if
    // required config is exported.
    if (in_array($strategy, ['core-only', 'config-split'])) {
      $core_config_file = $this->getConfigValue('docroot') . '/' . $this->getConfigValue("cm.core.dirs.$cm_core_key.path") . '/core.extension.yml';

      if (!file_exists($core_config_file)) {
        $this->logger->warning("BLT will NOT import configuration, $core_config_file was not found.");
        // This is not considered a failure.
        return 0;
      }
    }

    // If exported site UUID does not match site active site UUID, set active
    // to equal exported.
    // @see https://www.drupal.org/project/drupal/issues/1613424
    $exported_site_uuid = $this->getExportedSiteUuid($cm_core_key);
    if ($exported_site_uuid) {
      $task->drush("config:set system.site uuid $exported_site_uuid");
    }

    switch ($strategy) {
      case 'features':
        $this->importFeatures($task, $cm_core_key);
        break;

      case 'core-only':
        $this->importCoreOnly($task, $cm_core_key);
        break;

      case 'config-split':
        // Drush task explicitly to turn on config_split and check if it was
        // successfully enabled. Otherwise default to core-only.
        $check_task = $this->taskDrush();
        $check_task->drush("pm-enable")->arg('config_split');
        $result = $check_task->run();
        if (!$result->wasSuccessful()) {
          $this->logger->warning('Import strategy is config-split, but the config_split module does not exist. Falling back to core-only.');
          $this->importCoreOnly($task, $cm_core_key);
          break;
        }
        $this->importConfigSplit($task, $cm_core_key);
        break;
    }

    $task->drush("cache-rebuild");
    $result = $task->run();
    if (!$result->wasSuccessful()) {
      throw new BltException("Failed to import configuration!");
    }

    if ($strategy == 'features') {
      $this->checkFeaturesOverrides($cm_core_key);
    }
    $this->checkConfigOverrides();

    $result = $this->invokeHook('post-config-import');

    // Redundant cache-rebuild upon the conclusion of drupal:config:import
    // to resolve fatal errors post-config actions.
    $task = $this->taskDrush();
    $task->drush("cache-rebuild")->run();

    return $result;
  }

  /**
   * Import configuration using features module.
   *
   * @param mixed $task
   *   Drush task.
   * @param string $cm_core_key
   *   Cm core key.
   */
  protected function importFeatures($task, $cm_core_key) {
    $task->drush("config-import")->arg($cm_core_key)->option('partial');
    $task->drush("pm-enable")->arg('features');
    $task->drush("cc")->arg('drush');
    if ($this->getConfig()->has('cm.features.bundle')) {
      // Clear drush caches to register features drush commands.
      foreach ($this->getConfigValue('cm.features.bundle') as $bundle) {
        $task->drush("features-import-all")->option('bundle', $bundle);
        // Revert all features again!
        // @see https://www.drupal.org/node/2851532
        $task->drush("features-import-all")->option('bundle', $bundle);
      }
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
