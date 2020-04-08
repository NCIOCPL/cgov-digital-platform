<?php

namespace Drupal\cgov_glossary\Plugin\app_module;

use Drupal\app_module\Plugin\app_module\MultiRouteAppModulePluginBase;
use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Glossary App Module Plugin.
 *
 * App Module used for discovery tests.
 *
 * @AppModulePlugin(
 *   id = "cgov_glossary_app_module_plugin",
 *   label = @Translation("Glossary App Module Plugin")
 * )
 */
class GlossaryAppModulePlugin extends MultiRouteAppModulePluginBase {

  /**
   * Gets the default route builder.
   *
   * @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface
   */
  private $defaultBuilder;

  /**
   * Gets the expand route builder.
   *
   * @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface
   */
  private $expandBuilder;

  /**
   * Gets the search route builder.
   *
   * @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface
   */
  private $searchBuilder;

  /**
   * Gets the definition route builder.
   *
   * @var \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface
   */
  private $definitionBuilder;

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
   * @param \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface $expand_builder
   *   The expand route builder.
   * @param \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface $search_builder
   *   The search route builder.
   * @param \Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderInterface $definition_builder
   *   The definition route builder.
   */
  public function __construct(
    array $configuration,
    $plugin_id,
    $plugin_definition,
    MultiRouteAppModuleBuilderInterface $default_builder,
    MultiRouteAppModuleBuilderInterface $expand_builder,
    MultiRouteAppModuleBuilderInterface $search_builder,
    MultiRouteAppModuleBuilderInterface $definition_builder
  ) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->definition = $plugin_definition + $configuration;
    $this->defaultBuilder = $default_builder;
    $this->expandBuilder = $expand_builder;
    $this->searchBuilder = $search_builder;
    $this->definitionBuilder = $definition_builder;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('cgov_glossary.app_route_default'),
      $container->get('cgov_glossary.app_route_expand'),
      $container->get('cgov_glossary.app_route_search'),
      $container->get('cgov_glossary.app_route_definition')
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
     *   2. The params array is used because the expand character, search text,
     *      or term name/ID is part of the path, such as
     *      /publications/dictionaries/cancer-terms/expand/A,
     *      /publications/dictionaries/cancer-terms/search/meta, and
     *      /publications/dictionaries/cancer-terms/def/metastatic.
     */

    switch ($path_components[0]) {
      case "expand":
        $param = isset($path_components[1]) ? ['expandChar' => $path_components[1]] : [];
        return [
          'app_module_route' => '/' . $path_components[0],
          'params' => $param,
        ];

      case "ampliar":
        $param = isset($path_components[1]) ? ['expandChar' => $path_components[1]] : [];
        return [
          'app_module_route' => '/' . $path_components[0],
          'params' => $param,
        ];

      case "search":
        $param = isset($path_components[1]) ? ['searchText' => $path_components[1]] : [];
        return [
          'app_module_route' => '/' . $path_components[0],
          'params' => $param,
        ];

      case "buscar":
        $param = isset($path_components[1]) ? ['searchText' => $path_components[1]] : [];
        return [
          'app_module_route' => '/' . $path_components[0],
          'params' => $param,
        ];

      case "def":
        $param = isset($path_components[1]) ? ['idorname' => $path_components[1]] : [];
        return [
          'app_module_route' => '/' . $path_components[0],
          'params' => $param,
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
      case '/expand':
        return $this->expandBuilder;

      case '/ampliar':
        return $this->expandBuilder;

      case '/search':
        return $this->searchBuilder;

      case '/buscar':
        return $this->searchBuilder;

      case '/def':
        return $this->definitionBuilder;

      default:
        return $this->defaultBuilder;
    }
  }

}
