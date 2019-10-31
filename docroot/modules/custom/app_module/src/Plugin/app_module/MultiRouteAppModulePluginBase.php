<?php

namespace Drupal\app_module\Plugin\app_module;

/**
 * This is the basis for most app modules.
 *
 * This base implements a more pluggable way of getting a build array
 * for a route.
 *
 * NOTE: Any derriving class really should implement the Create and
 * __constructor methods to load its builders.
 */
abstract class MultiRouteAppModulePluginBase extends AppModulePluginBase {

  /**
   * {@inheritdoc}
   *
   * This is marked as final in order to ensure no one messes up
   * our logic for coordinating the building of the render array.
   *
   * TODO: This should have an actual implements that allows for
   * creating app module routes, ala .routing.yml files. That way
   * the arg loading and controller picking is handled here and
   * an app module developer only needs to make a .yml file, and
   * a couple of classes. (rather than also needed to handle string
   * parsing and what not.)
   */
  final public function buildForRoute($path, $options = []) {

    // Load builder.
    /* @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase */
    $builder = $this->getBuilderForRoute($path);

    if ($builder) {
      // Execute the build.
      return $builder->build($options);
    }
    else {
      return [];
    }
  }

  /**
   * {@inheritdoc}
   */
  final public function getAppRouteId($path, array $options = []) {
    /* @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase */
    $builder = $this->getBuilderForRoute($path);

    if ($builder) {
      return $builder->id();
    }
    else {
      return 'unknown_route';
    }
  }

  /**
   * {@inheritdoc}
   *
   * This is marked as final in order to ensure no one messes up
   * our logic for coordinating the building of the render array.
   */
  final public function getCacheInfoForRoute($path, array $options = []) {

    /* @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase */
    $builder = $this->getBuilderForRoute($path);

    if ($builder) {
      return $builder->getCacheInfo($options);
    }
    else {
      // This should create a cacheable metadata with a cacheMaxAge of 0.
      return CacheableMetadata::createFromObject(NULL);
    }
  }

}
