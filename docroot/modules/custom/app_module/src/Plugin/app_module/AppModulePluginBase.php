<?php

namespace Drupal\app_module\Plugin\app_module;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Plugin\PluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Base class for Application Module plugin types.
 */
abstract class AppModulePluginBase extends PluginBase implements AppModulePluginInterface, ContainerFactoryPluginInterface {

  /**
   * Plugins's definition.
   *
   * @var array
   */
  public $definition;

  /**
   * Constructs a AppModulePluginBase object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->definition = $plugin_definition + $configuration;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public function pluginTitle() {
    return $this->definition['label'];
  }

  /**
   * {@inheritdoc}
   */
  public function pluginId() {
    return $this->definition['id'];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfoForRoute($path, array $options = []) {
    // This should create a cacheable metadata with a cacheMaxAge of 0.
    return CacheableMetadata::createFromObject(NULL);
  }

}
