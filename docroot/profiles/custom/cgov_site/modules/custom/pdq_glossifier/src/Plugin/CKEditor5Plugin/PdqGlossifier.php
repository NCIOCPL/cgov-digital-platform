<?php

declare(strict_types=1);

namespace Drupal\pdq_glossifier\Plugin\CKEditor5Plugin;

use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableTrait;
use Drupal\ckeditor5\Plugin\CKEditor5PluginDefault;
use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\editor\EditorInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * CKEditor 5 PDQ Glossifier plugin configuration.
 */
class PdqGlossifier extends CKEditor5PluginDefault implements ContainerFactoryPluginInterface {

  use CKEditor5PluginConfigurableTrait;

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactory
   */
  protected $configFactory;

  /**
   * {@inheritdoc}
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactory $config_factory) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configFactory = $config_factory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDynamicPluginConfig(array $static_plugin_config, EditorInterface $editor): array {
    // Get the configs for the all possible filters (enabled or not).
    $filter_configs = $editor->getFilterFormat()->filters()->getConfiguration();

    // If for some reason the filter does not exist or it is not
    // enables then we need to note this. (It is an issue.)
    if (!array_key_exists('', $filter_configs) || $filter_configs['nci_definition']['status'] !== TRUE) {
      return [
        'nci_definition' => [
          'classes' => 'FILTER_NOT_SET',
        ],
      ];
    }

    /*
     * $nci_definition_settings = $filter_configs['nci_definition']['settings'];
     */
    return [
      'nci_definition' => [
        'classes' => 'FILTER_SET',
      ],
    ];
  }

}
