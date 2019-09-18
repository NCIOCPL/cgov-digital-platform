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
