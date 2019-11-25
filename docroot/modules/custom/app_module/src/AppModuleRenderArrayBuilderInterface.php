<?php

namespace Drupal\app_module;

/**
 * Helper service for creating app_module Render arrays.
 *
 * This is a helper service to handle the creation of app_module render arrays.
 * This is to be used by the AppModuleReferenceFieldFormatter and any other use
 * cases that can be identified. The most important part of this is to handle
 * cache tags and theming of the app_module wrapper.
 */
interface AppModuleRenderArrayBuilderInterface {

  /**
   * Creates a render array for an app module.
   *
   * @param \Drupal\app_module\AppModuleInterface $app_module
   *   The app_module entity to "render".
   * @param array $options
   *   Configuration parameters for the app module. These are usually set
   *   on a app module reference field or something.
   *
   * @return array
   *   A renderable array representing the content of the block.
   */
  public function build(AppModuleInterface $app_module, array $options);

  /**
   * Gets a Cache Dependency for this App Module Route.
   *
   * @param AppModuleInterface $app_module
   *   The AppModule Entity being viewed.
   * @param string $path
   *   The current app module route.
   * @param array $options
   *   The instance options for that app module.
   *
   * @return \Drupal\Core\Cache\CacheableDependencyInterface
   *   The cache dependency.
   */
  public static function getCacheDependencyForBuild(AppModuleInterface $app_module, $path, array $options = []);

}
