<?php

namespace Drupal\app_module\Plugin\app_module;

/**
 * Base class for creating builders for Multi Route app modules.
 *
 * An implementation of these should represent a single route of
 * and app module. The intent of this class is that you can
 * encapsulate all of the logic for this single view in one
 * place and not have a AppModulePlugin that is littered with
 * switches and callbacks.
 *
 * You will need to register any implmented classes as a
 * service.
 */
abstract class MultiRouteAppModuleBuilderBase implements MultiRouteAppModuleBuilderInterface {

  /**
   * {@inheritdoc}
   */
  abstract public function build(array $options);

  /**
   * {@inheritdoc}
   */
  public function getCacheInfo(array $options) {
    // This should create a cacheable metadata with a cacheMaxAge of 0.
    return CacheableMetadata::createFromObject(NULL);
  }

}
