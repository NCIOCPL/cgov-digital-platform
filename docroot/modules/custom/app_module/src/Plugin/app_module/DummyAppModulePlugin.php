<?php

namespace Drupal\app_module\Plugin\app_module;

/**
 * Dummy App Module Plugin.
 *
 * Placeholder app module for use by required fields - maybe you want a
 * field to exist before all of your app modules are built. This dummy
 * app module can be used to do just that.
 *
 * @AppModulePlugin(
 *   id = "dummy_app_module_plugin",
 *   label = @Translation("Dummy App Module Plugin")
 * )
 */
class DummyAppModulePlugin extends AppModulePluginBase {

  /**
   * {@inheritdoc}
   */
  protected function matchRouteInternal(array $path_components, array $options = []) {
    // This will listen to anything, always returning the default route as
    // a match.
    return [
      'app_module_route' => '/',
      'params' => [],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getAppRouteId($path, array $options = []) {
    return 'default';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForRoute($path, array $options = []) {
    $build = [
      '#markup' => "<div>App Module Placeholder</div>",
    ];

    return $build;
  }

}
