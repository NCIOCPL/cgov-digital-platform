<?php

namespace Drupal\app_module\Plugin\app_module;

use Drupal\Component\Plugin\PluginInspectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides an interface for all Application Module plugins.
 */
interface AppModulePluginInterface extends PluginInspectionInterface {

  /**
   * Return the human readable name of the plugin.
   *
   * This appears on the ui in plugin selection interfaces.
   *
   * @return string
   *   The human readable name.
   */
  public function pluginTitle();

  /**
   * Return the id of the plugin.
   *
   * @return string
   *   The id of the plugin.
   */
  public function pluginId();

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition);

  /**
   * Gets the app_module route information from a path.
   *
   * Example return value structure for the string /bar/23 if the route is
   * /bar and the id parameter is 23.
   * @code
   * $route_info = [
   *   'app_module_route' => '/bar',
   *   'params' => [
   *     'id' => 23
   *   ]
   * ]
   * @endcode
   *
   * @param string $path
   *   A full unprocessed path of the app module. This will contain parameters
   *   as part of the route, but will have had the parent entity's alias
   *   stripped from the path. (e.g. the parent entity is /foo, the app module
   *   route is /bar and the parameters for bar are 23. The requested url would
   *   be /foo/bar/23 and this $path would be /bar/23.)
   *   NOTE: To make it more clear, this would not the same as $path in the
   *   other methods in this class. They all would expect $path to be /bar in
   *   our example.
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @return array|null
   *   The route info or NULL if the route was not matched. See above for
   *   an example route info array.
   *   NOTE: the array key 'app_module_route' is REQUIRED!
   *
   * @throws InvalidArgumentException
   *   Thrown if $path does not begin with a slash(/).
   */
  public function matchRoute($path, array $options = []);

  /**
   * Builds and returns a renderable array for a route of this appmodule plugin.
   *
   * @param string $path
   *   The requested app module path as a string. This is relative to the
   *   app module alias. For the node /foo/bar, if the url requested is
   *   /foo/bar/bazz/blah then the $path would be /bazz/blah.
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @return array
   *   A renderable array representing the content of the block.
   *
   * @see \Drupal\app_module\AppModuleRenderArrayBuilder
   */
  public function buildForRoute($path, array $options = []);

  /**
   * Gets the machine id of the app module route.
   *
   * This should match the same format as a machine id.
   *
   * @param string $path
   *   The requested app module path as a string. This is relative to the
   *   app module alias. For the node /foo/bar, if the url requested is
   *   /foo/bar/bazz/blah then the $path would be /bazz/blah.
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @return string
   *   A machine id compatible route id.
   */
  public function getAppRouteId($path, array $options = []);

  /**
   * Gets cacheability metadata for an app modules route.
   *
   * This is used by the AppModuleRenderArrayBuilder to generate the build
   * object. Best practice is to add cache tags to a render array and provide
   * a #preRender callback so the item can be cached without requiring the
   * markup to be built each time, only to get it from the render cache.
   *
   * @param string $path
   *   The requested app module path as a string. This is relative to the
   *   app module alias. For the node /foo/bar, if the url requested is
   *   /foo/bar/bazz/blah then the $path would be /bazz/blah.
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @return \Drupal\Core\Cache\CacheableMetadata
   *   Cacheability metadata for the specific route. Most importantly this
   *   should contain the cacheTags for parameters in the request. E.g.
   *   the dictionary term id, the parameters of a search, etc. Additionally
   *   this should also take into account any parameters in $options. For
   *   example if the script generated on the page is tied to the params
   *   in the options you will need a way to clear them out if you want to
   *   target a specific item. As this is a CacheableMetadata object you
   *   can also include any contexts or cache age settings as well.
   *   See https://www.drupal.org/docs/8/api/render-api/cacheability-of-render-arrays#s-the-thought-process
   */
  public function getCacheInfoForRoute($path, array $options = []);

  /**
   * Alter attachments (typically assets) to a page before it is rendered.
   *
   * Override this method when you want to remove or alter attachments on the
   * page, or add attachments to the page that depend on another module's
   * attachments. More specifically, implement this method to manipulate the
   * page's metadata.
   *
   * If you try to add anything but #attached and #cache to the array, an
   * exception is thrown.
   *
   * @param array &$attachments
   *   Array of all attachments provided by hook_page_attachments()
   *   implementations.
   * @param string $path
   *   The requested app module path as a string. This is relative to the
   *   app module alias. For the node /foo/bar, if the url requested is
   *   /foo/bar/bazz/blah then the $path would be /bazz/blah.
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @see hook_page_attachments()
   */
  public function alterPageAttachments(array &$attachments, $path, array $options = []);

  /**
   * Alter replacement values for tokens.
   *
   * Override this method when you want to change the contents for tokens for
   * specific placeholder. More specifically, this is an easier way to
   * manipulate the page's metadata rather than digging around page attachments.
   *
   * NOTE: The bubbleableMetadata will be taken care of by the app module
   * framework. Just know that it will use getCacheInfo to get tags and
   * contexts.
   *
   * @param array &$replacements
   *   An associative array of replacements returned by hook_tokens().
   * @param array $context
   *   The context in which hook_tokens() was called. An associative array with
   *   the following keys, which have the same meaning as the corresponding
   *   parameters of hook_tokens():
   *   - 'type'
   *   - 'tokens'
   *   - 'data'
   *   - 'options'.
   * @param string $path
   *   The requested app module path as a string. This is relative to the
   *   app module alias. For the node /foo/bar, if the url requested is
   *   /foo/bar/bazz/blah then the $path would be /bazz/blah.
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @see hook_tokens()
   */
  public function alterTokens(array &$replacements, array $context, $path, array $options = []);

  /**
   * Gets the list of metadata tokens for this app module to alter.
   *
   * @param string $path
   *   The requested app module path as a string. This is relative to the
   *   app module alias. For the node /foo/bar, if the url requested is
   *   /foo/bar/bazz/blah then the $path would be /bazz/blah.
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @return array
   *   Returns an array with the tokens that this app module should alter.
   */
  public function getTokensForAltering($path, array $options = []);

}
