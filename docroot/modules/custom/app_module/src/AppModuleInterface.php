<?php

namespace Drupal\app_module;

use Drupal\Core\Config\Entity\ConfigEntityInterface;
use Drupal\Core\Entity\EntityWithPluginCollectionInterface;

/**
 * Provides an interface defining an App Module entity.
 */
interface AppModuleInterface extends ConfigEntityInterface, EntityWithPluginCollectionInterface {

  /**
   * Gets the application module plugin.
   *
   * @return \Drupal\app_module\Plugin\AppModulePluginInterface|null
   *   The AppModule plugin or NULL if the plugin id was not set yet.
   */
  public function getAppModulePlugin();

}
