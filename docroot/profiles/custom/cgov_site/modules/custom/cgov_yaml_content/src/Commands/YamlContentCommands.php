<?php

namespace Drupal\cgov_yaml_content\Commands;

use Drupal\Component\Serialization\Yaml;
use Drupal\Component\Utility\Crypt;
use Drupal\Component\Uuid\Php as Uuid;
use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Config\Config;
use Drush\Commands\DrushCommands;

// WARNING!! This is deprecated, but drush still needs it, at the same time,
// there is no replacement yet. See drush issue #4935.
use Webmozart\PathUtil\Path;

/**
 * A Drush command to load blocks related to YAML content.
 *
 * @package Drupal\cgov_yaml_content\Commands
 */
class YamlContentCommands extends DrushCommands {

  /**
   * The Config Factory.
   *
   * @var \Drupal\Core\Config\ConfigFactory
   */
  protected $configFactory;

  /**
   * UUID Service.
   *
   * @var \Drupal\Component\Uuid\Php
   */
  protected $uuidSvc;

  /**
   * Creates a new instance of a YamlContentCommands class.
   *
   * @param \Drupal\Core\Config\ConfigFactory $configFactory
   *   An instance of the config factory.
   * @param \Drupal\Component\Uuid\Php $uuidSvc
   *   Drupal UUID Service.
   */
  public function __construct(ConfigFactory $configFactory, Uuid $uuidSvc) {
    $this->configFactory = $configFactory;
    $this->uuidSvc = $uuidSvc;
  }

  /**
   * Drush command to load blocks related to YAML content.
   *
   * @command cgov:load-dev-blocks
   * @usage drush cgov:load-dev-blocks
   *   Loads block configs for dev environment.
   */
  public function loadDevBlocks() {
    $this->logger->notice('Loading development blocks from cgov_yaml_content/dev_blocks');
    // Set the path to blocks set to <module_root>/dev_blocks.
    $config_path = Path::join([__DIR__, '..', '..', 'dev_blocks']);

    // Get the configs to load, only allowing .yml files.
    $configs_to_load = array_filter(
      scandir($config_path),
      fn($file_name) => preg_match('/.yml$/', $file_name)
    );

    foreach ($configs_to_load as $block_config_file) {
      $block_data_to_load = Yaml::decode(file_get_contents(Path::join($config_path, $block_config_file)));

      if (empty($block_data_to_load['id'])) {
        $this->logger->error('Cannot find ID for ' . $block_config_file . '. Skipping...');
        continue;
      }

      $this->loadOrReplaceBlock($block_config_file, $block_data_to_load);
    }

  }

  /**
   * Helper function to load or replace block config.
   */
  private function loadOrReplaceBlock($block_config_file, array $block_data_to_load) {
    $config_name = str_replace('.yml', '', $block_config_file);

    $config = $this->configFactory->getEditable($config_name);
    $config_raw_data = $config->getRawData();

    if (count($config_raw_data) === 0) {
      $this->createBlock($config_name, $block_data_to_load, $config);
    }
    else {
      $this->updateBlock($config_name, $block_data_to_load, $config);
    }
  }

  /**
   * Updates an existing block.
   *
   * @param string $config_name
   *   The config name.
   * @param array $block_data_to_load
   *   The config used to replace.
   * @param \Drupal\Core\Config\Config $config
   *   The config object.
   */
  private function updateBlock($config_name, array $block_data_to_load, Config $config) {
    $this->logger->notice('Updating Block: ' . $config_name);
    $block_data_to_load['uuid'] = $config->get('uuid');
    $config->setData($block_data_to_load);
    $config->set('_core', ['default_config_hash' => Crypt::hashBase64(serialize($block_data_to_load))]);
    $config->save();
  }

  /**
   * Creates a new block.
   *
   * @param string $config_name
   *   The config name.
   * @param array $block_data_to_load
   *   The config used to replace.
   * @param \Drupal\Core\Config\Config $config
   *   The config object.
   */
  private function createBlock($config_name, array $block_data_to_load, Config $config) {
    $this->logger->notice('Adding Block: ' . $config_name);
    $block_data_to_load['uuid'] = $this->uuidSvc->generate();
    $config->setData($block_data_to_load);
    $config->set('_core', ['default_config_hash' => Crypt::hashBase64(serialize($block_data_to_load))]);
    $config->save();
  }

}
