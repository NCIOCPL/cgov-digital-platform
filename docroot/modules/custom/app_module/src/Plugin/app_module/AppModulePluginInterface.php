<?php

namespace Drupal\app_module\Plugin\app_module;

use Drupal\Component\Plugin\PluginInspectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides an interface for all Application Module plugins.
 */
interface AppModulePluginInterface extends PluginInspectionInterface {

  /**
   * Return the human readable name of the display.
   *
   * This appears on the ui in plugin selection interfaces.
   *
   * @return string
   *   The human readable name.
   */
  public function pluginTitle();

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition);

}
