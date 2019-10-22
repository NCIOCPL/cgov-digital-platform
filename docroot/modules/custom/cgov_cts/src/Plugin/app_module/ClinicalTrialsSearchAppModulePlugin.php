<?php

namespace Drupal\cgov_cts\Plugin\app_module;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModulePluginBase;
use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Clinical Trials Search App Module Plugin.
 *
 * App Module used for discovery tests.
 *
 * @AppModulePlugin(
 *   id = "cgov_cts_app_module_plugin",
 *   label = @Translation("Clinical Trials App Module Plugin")
 * )
 */
class ClinicalTrialsSearchAppModulePlugin extends MultiRouteAppModulePluginBase {

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
  private $viewDetailsBuilder;

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
   * @param \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface $view_details_builder
   *   The chicken route builder.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    MultiRouteAppModuleBuilderInterface $default_builder,
    MultiRouteAppModuleBuilderInterface $view_details_builder
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->definition = $plugin_definition + $configuration;
    $this->defaultBuilder = $default_builder;
    $this->viewDetailsBuilder = $view_details_builder;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_cts.app_route_default'),
      $container->get('cgov_cts.app_route_view_details')
    );
  }

  /**
   * {@inheritdoc}
   */
  protected function matchRouteInternal(array $path_components, array $options = []) {

    /* NOTES:
     *   1. The base plugin handles an empty array of paths as a request for /,
     *      you don't have to handle it.
     *      * If the module has a default route, but takes in a parameter, as
     *        in /{foo} then this would need to be processed here. /.../search
     *        will be the pretty URL, and there are no params after it, so for
     *        this app module the base class handling of the default route
     *        is ok.
     *   2. the params array is only used if the ID is part of the path, suchas
     *      /.../clinical-trials/search/v/nci-2019-0001. Since ours is passed
     *      in as a query param, then none is needed.
     */
    switch ($path_components[0]) {
      case "advanced":
      case "r":
      case "v":
        return [
          'app_module_route' => '/' . $path_components[0],
          'params' => [],
        ];
    }
    // No route, so return NULL to let Drupal handle it as a 404.
    return NULL;
  }

  /**
   * {@inheritdoc}
   */
  protected function getBuilderForRoute($path) {

    switch ($path) {
      case '/v':
        return $this->viewDetailsBuilder;

      default:
        return $this->defaultBuilder;
    }
  }

}
