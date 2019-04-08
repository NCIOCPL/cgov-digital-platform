<?php

namespace Drupal\cgov_site\Commands;

use Drupal\config_split\ConfigSplitCliService;
use Drupal\Core\Config\ConfigManagerInterface;
use Drupal\Core\Config\StorageInterface;
use Drush\Commands\DrushCommands;

/**
 * Class CgovSiteCommands.
 *
 * This is the Drush 9 command.
 *
 * @package Drupal\cgov_site\Commands
 */
class CgovSiteCommands extends DrushCommands {

  /**
   * The interoperability cli service.
   *
   * @var \Drupal\config_split\ConfigSplitCliService
   */
  protected $cliService;

  /**
   * Drupal\Core\Config\ConfigManager definition.
   *
   * @var \Drupal\Core\Config\ConfigManager
   */
  protected $configManager;

  /**
   * Active Config Storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $activeStorage;

  /**
   * Sync Config Storage.
   *
   * @var \Drupal\Core\Config\StorageInterface
   */
  protected $syncStorage;

  /**
   * CgovSiteCommands constructor.
   *
   * @param \Drupal\config_split\ConfigSplitCliService $cliService
   *   The CLI service which allows interoperability.
   * @param \Drupal\cgov_site\Commands\ConfigManagerInterface $config_manager
   *   The config manager.
   * @param \Drupal\cgov_site\Commands\StorageInterface $active_storage
   *   The active storage service.
   * @param \Drupal\cgov_site\Commands\StorageInterface $sync_storage
   *   The sync storage service.
   */
  public function __construct(
    ConfigSplitCliService $cliService,
    ConfigManagerInterface $config_manager,
    StorageInterface $active_storage,
    StorageInterface $sync_storage) {

    $this->cliService = $cliService;
    $this->configManager = $config_manager;
    $this->activeStorage = $active_storage;
    $this->syncStorage = $sync_storage;
  }

  /**
   * Loops through and imports all active splits.
   *
   * @command cgov:config-split-import-all
   * @aliases cgov-csia
   * @usage cgov-csia
   *   Imports all active configuration splits.
   */
  public function cgovImportAllActiveSplits() {
    // Import config split configurations.
    foreach ($this->syncStorage->listAll('config_split.config_split.') as $name) {
      $this->activeStorage->write($name, $this->syncStorage->read($name));
      $this->output()->writeln('Configuration successfully imported for ' . $name . '.');
    }

    // Import all configurations.
    foreach ($this->syncStorage->listAll('config_split.config_split.') as $name) {
      // Load config split name.
      $config_name = explode('.', $name);
      $split_name = $config_name[2];

      // Determine if this split is active (including overrides):
      $is_active = $this->configManager->getConfigFactory()->get($name)->get('status');
      if ($is_active) {
        $this->cliService->ioImport($split_name, $this->io(), 'dt');
        $this->output()->writeln('Split configurations successfully imported for ' . $split_name . '.');
      }
    }

  }

}
