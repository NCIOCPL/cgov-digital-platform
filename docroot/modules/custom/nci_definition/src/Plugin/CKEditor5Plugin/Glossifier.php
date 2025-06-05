<?php

declare(strict_types=1);

namespace Drupal\nci_definition\Plugin\CKEditor5Plugin;

use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableTrait;
use Drupal\ckeditor5\Plugin\CKEditor5PluginDefault;
use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\editor\EditorInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * CKEditor 5 Glossifier plugin configuration.
 */
class Glossifier extends CKEditor5PluginDefault implements ContainerFactoryPluginInterface {

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
    // Get the NCI Definition config.
    $settings_config = $this->configFactory->get('nci_definition.settings');

    $plugin_config = [
      'nci_definition' => [
        'definition_classes' => $settings_config->get('definition_classes'),
        'nci_glossary_dictionary_urls' => $settings_config->get('nci_glossary_dictionary_urls'),
      ],
    ];

    // Get the configs for the all possible filters (enabled or not).
    $filter_configs = $editor->getFilterFormat()->filters()->getConfiguration();

    if (
      isset($filter_configs['nci_definition']['status']) &&
      $filter_configs['nci_definition']['status'] === TRUE &&
      isset($filter_configs['nci_definition']['definition_classes'])
    ) {
      $plugin_config['nci_definition']['definition_classes'] = $filter_configs['nci_definition']['definition_classes'];
    }

    return $plugin_config;
  }

}
