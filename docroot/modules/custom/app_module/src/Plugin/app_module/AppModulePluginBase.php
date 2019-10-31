<?php

namespace Drupal\app_module\Plugin\app_module;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Drupal\Core\Plugin\PluginBase;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Base class for Application Module plugin types.
 */
abstract class AppModulePluginBase extends PluginBase implements AppModulePluginInterface, ContainerFactoryPluginInterface {

  /**
   * Plugins's definition.
   *
   * @var array
   */
  public $definition;

  /**
   * Constructs a AppModulePluginBase object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->definition = $plugin_definition + $configuration;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static($configuration, $plugin_id, $plugin_definition);
  }

  /**
   * {@inheritdoc}
   */
  public function pluginTitle() {
    return $this->definition['label'];
  }

  /**
   * {@inheritdoc}
   */
  public function pluginId() {
    return $this->definition['id'];
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfoForRoute($path, array $options = []) {
    // This should create a cacheable metadata with a cacheMaxAge of 0.
    return CacheableMetadata::createFromObject(NULL);
  }

  /**
   * {@inheritdoc}
   */
  final public function matchRoute($path, array $options = []) {
    if (strlen($path) === 0 || substr($path, 0, 1) !== "/") {
      throw new InvalidArgumentException("matchRoute expects \$path to begin with /.");
    }

    // Split and remove white space around components, removing the first
    // element. (The first element being the empty string before the /)
    $path_components = array_slice(
      array_map(
        function ($component) {
          return trim($component);
        },
        explode('/', $path)
      ),
      1
    );

    // Get the count for shorter code below.
    $path_count = count($path_components);

    // Based on the startsWith('/') test and the array slicing,
    // if there is only 1 element and it is an empty string, then
    // we know the request was just to '/'.
    if (($path_count == 1 && strlen($path_components[0]) == 0)) {
      return [
        'app_module_route' => '/',
        'params' => [],
      ];
    }

    // We have something in path components, so call the specific
    // implementation logic to figure out what to do.
    return $this->matchRouteInternal($path_components, $options);
  }

  /**
   * Gets the app_module route information from a path broken into an array.
   *
   * This is an internal method called by matchRoute. This was done so that
   * each implementation did not have to break up the path and we could share
   * that logic.
   *
   * @param string[] $path_components
   *   An array of strings representing the path split on slash (/).
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @return array|null
   *   The route info or NULL if the route was not matched. See
   *   \Drupal\app_module\Plugin\app_module\AppModulePluginInterface for an
   *   example of the return object.
   *   NOTE: the array key 'app_module_route' is REQUIRED!
   */
  abstract protected function matchRouteInternal(array $path_components, array $options = []);

}
