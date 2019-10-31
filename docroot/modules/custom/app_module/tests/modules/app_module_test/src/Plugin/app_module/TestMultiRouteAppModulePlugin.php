<?php

namespace Drupal\app_module_test\Plugin\app_module;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModulePluginBase;
use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Test of multi route app module plugin.
 *
 * App Module used for discovery tests.
 *
 * @AppModulePlugin(
 *   id = "test_multi_route_app_module_plugin",
 *   label = @Translation("Test Multi Route App Module Plugin")
 * )
 */
class TestMultiRouteAppModulePlugin extends MultiRouteAppModulePluginBase {

  /**
   * Gets the default route builder.
   *
   * @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface
   */
  private $defaultBuilder;

  /**
   * Gets the default route builder.
   *
   * @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface
   */
  private $chickenBuilder;

  /**
   * Constructs a AppModulePluginBase object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface $default_builder
   *   The default route builder.
   * @param \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface $chicken_builder
   *   The chicken route builder.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    MultiRouteAppModuleBuilderInterface $default_builder,
    MultiRouteAppModuleBuilderInterface $chicken_builder
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->definition = $plugin_definition + $configuration;
    $this->defaultBuilder = $default_builder;
    $this->chickenBuilder = $chicken_builder;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('app_module_test.route_default'),
      $container->get('app_module_test.route_chicken')
    );
  }

  /**
   * {@inheritdoc}
   *
   * NOTE: I do not see a need for having some abstraction around the
   * multi-route handling of matches. In the future if routes are
   * defined in yml files, then it would make sense for route matches
   * to be handled in the multi-route base.
   */
  protected function matchRouteInternal(array $path_components, array $options = []) {
    $route_info = NULL;

    if ($path_components[0] == 'chicken') {

      $route_info = [
        'app_module_route' => '/chicken',
        'params' => [],
      ];

      // Match optional parameters.
      if (count($path_components) > 1) {
        $route_info['params']['id'] = $path_components[1];
      }

      if (count($path_components) > 2) {
        $route_info['params']['color'] = $path_components[2];
      }

    }

    return $route_info;
  }

  /**
   * {@inheritdoc}
   */
  protected function getBuilderForRoute($path) {

    switch ($path) {
      case '/chicken':
        return $this->chickenBuilder;

      default:
        return $this->defaultBuilder;
    }
  }

}
