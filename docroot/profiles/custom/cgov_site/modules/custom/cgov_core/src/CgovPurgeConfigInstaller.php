<?php

namespace Drupal\cgov_core;

use Drupal\Core\Config\ConfigFactoryInterface;

/**
 * Class to install purge configuration.
 *
 * We have a couple of different cache modules depending on the environment.
 * Unfortunately Features cannot support more than one config file per config
 * object in a docroot. (Even if only one module is ever installed) So this
 * is a helper for those modules to not only install the purge config on
 * install, but update it in update hooks.
 */
class CgovPurgeConfigInstaller {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The list of available purgers.
   */
  private const PURGERS = [
    'acquia_purge' => '8813de186f',
    'akamai_tag' => 'bf950143a3',
  ];

  /**
   * Creates a new instance of the CgovPurgeConfigInstall class.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $factory
   *   A Config Factory Interface.
   */
  public function __construct(
    ConfigFactoryInterface $factory
  ) {
    $this->configFactory = $factory;
  }

  /**
   * Create purge configs with the supplied purgers.
   *
   * We have a couple of different cache modules depending on the environment.
   * Unfortunately Features cannot support more than one config file per config
   * object in a docroot. (Even if only one module is ever installed) So this
   * is a helper for those modules to not only install the purge config on
   * install, but update it in update hooks.
   *
   * @param array $purgers
   *   An array of the purgers to enable.
   */
  public function installPurgeConfiguration(array $purgers) {

    // Create the purge.plugins config.
    $plugins_config = [
      'purgers' => [],
    ];

    // Create the purge.logger_channels config.
    $logger_config = [
      'channels' => [
        [
          'id' => 'purgers',
          'grants' => [0, 2, 3],
        ],
        [
          'id' => 'queue',
          'grants' => [0, 2, 3],
        ],
        [
          'id' => 'diagnostics',
          'grants' => [3],
        ],
      ],
    ];

    $coretags_config = [
      'blacklist' => [
        '4xx-response',
        'theme_registry',
        'route_match',
        'routes',
      ],
    ];

    // The plugin indexes start at 2.
    $plugin_index = 2;

    foreach ($purgers as $purger) {
      // Check if the purgers are known.
      if (!array_key_exists($purger, self::PURGERS)) {
        throw new Exception($purger . " is not a known purger.");
      }

      // Add the plugin.
      $plugins_config['purgers'][] = [
        'order_index' => $plugin_index,
        'instance_id' => self::PURGERS[$purger],
        'plugin_id' => $purger,
      ];

      // Add the logger channel.
      $logger_config['channels'][] = [
        'id' => 'purger_' . $purger . "_" . self::PURGERS[$purger],
        'grants' => [0, 2, 3],
      ];

      $plugin_index++;
    }

    // Modify the plugin config.
    $editable_plugin_config = $this->configFactory->getEditable('purge.plugins');
    $editable_plugin_config->set('purgers', $plugins_config['purgers']);
    $editable_plugin_config->save();

    $editable_logger_config = $this->configFactory->getEditable('purge.logger_channels');
    $editable_logger_config->set('channels', $logger_config['channels']);
    $editable_logger_config->save();

    $editable_coretags_config = $this->configFactory->getEditable('purge_queuer_coretags.settings');
    $editable_coretags_config->set('blacklist', $coretags_config['blacklist']);
    $editable_coretags_config->save();
  }

}
