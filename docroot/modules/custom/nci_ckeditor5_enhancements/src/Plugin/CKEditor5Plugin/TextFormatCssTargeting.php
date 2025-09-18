<?php

declare(strict_types=1);

namespace Drupal\nci_ckeditor5_enhancements\Plugin\CKEditor5Plugin;

use Drupal\ckeditor5\Plugin\CKEditor5PluginConfigurableTrait;
use Drupal\ckeditor5\Plugin\CKEditor5PluginDefault;
use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Extension\ModuleHandler;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\editor\EditorInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * CKEditor 5 TextFormatCssTargeting plugin configuration.
 */
class TextFormatCssTargeting extends CKEditor5PluginDefault implements ContainerFactoryPluginInterface {

  use CKEditor5PluginConfigurableTrait;

  /**
   * The config factory.
   */
  protected ConfigFactory $configFactory;

  /**
   * The module handler.
   */
  protected ModuleHandler $moduleHandler;

  /**
   * {@inheritdoc}
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    ConfigFactory $config_factory,
    ModuleHandler $module_handler,
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->configFactory = $config_factory;
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('module_handler')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getDynamicPluginConfig(array $static_plugin_config, EditorInterface $editor): array {

    $css_classes = [
      'ck-content--' . str_replace('_', '-', $editor->id()),
    ];

    // Allow other modules to add their own classes.
    $this->moduleHandler->alter(
      'nci_ckeditor5_enhancements_editor_css_classes',
      $css_classes,
      $editor,
    );

    $plugin_config = [
      'text_format_css_targeting' => [
        'css_classes' => $css_classes,
        'format' => $editor->id(),
      ],
    ];

    return $plugin_config;
  }

}
