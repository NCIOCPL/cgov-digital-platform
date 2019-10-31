<?php

namespace Drupal\app_module;

use Drupal\Core\Cache\Cache;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Helper service for creating app_module Render arrays.
 *
 * This is a helper service to handle the creation of app_module render arrays.
 * This is to be used by the AppModuleReferenceFieldFormatter and any other use
 * cases that can be identified. The most important part of this is to handle
 * cache tags and theming of the app_module wrapper.
 */
class AppModuleRenderArrayBuilder implements AppModuleRenderArrayBuilderInterface {

  /**
   * Symfony\Component\HttpFoundation\RequestStack definition.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Constructs a AppModuleRenderArrayBuilder object.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request object.
   */
  public function __construct(
    RequestStack $request_stack
  ) {
    $this->requestStack = $request_stack;
  }

  /**
   * {@inheritdoc}
   */
  public function build(AppModuleInterface $app_module, array $options) {

    $build = [];

    /*
     * We need to do the following here:
     *  1. Load the plugin for the app module.
     *  2. Determine the app module route that is being requested.
     *  3. Generate a "view" build by calling buildForRoute
     *     * This mimics getting a view builder and calling view.
     *     * Our entity cannot have a viewbuilder because it would
     *       need to pass the instance options into the view() method,
     *       which is not possible.
     */
    $plugin = $app_module->getAppModulePlugin();

    // Determine the path.
    // The path processor will push the app module path into the request
    // object's query params.
    $path = $this->requestStack->getCurrentRequest()->query->get('app_module_route') ?? '/';

    // Get Cache Information from our Plugin and setup the cache information
    // for the build. This information will vary by route and params passed to
    // that route. So it is the job of the plugin to give us the correct
    // information.
    $cache_meta = $plugin->getCacheInfoForRoute($path, $options);
    $app_route_id = $plugin->getAppRouteId($path, $options);

    // We must always vary by the app_module_route parameter.
    $route_contexts = Cache::mergeContexts(
      ['url.query_args:app_module_route'],
      $app_module->getCacheContexts()
    );

    $build_cache = [
      'contexts' => Cache::mergeContexts(
        $cache_meta->getCacheContexts(),
        $route_contexts
      ),
      'tags' => Cache::mergeTags(
        $cache_meta->getCacheTags(),
        $app_module->getCacheTags()
      ),
      'max-age' => $cache_meta->getCacheMaxAge(),
    ];

    // Setup the app_module wrapper.
    $build = [
      '#theme' => 'app_module',
      '#attributes' => [],
      '#app_module_id' => $app_module->id(),
      '#app_module_plugin_id' => $plugin->pluginId(),
      '#app_route_id' => $app_route_id,
      '#configuration' => $options,
      // Save the app module and options for preRender.
      '#app_module_info' => [
        'path' => $path,
        'entity' => $app_module,
        'options' => $options,
      ],
      '#pre_render' => [
        static::class . '::preRender',
      ],
      '#cache' => $build_cache,
    ];

    return $build;
  }

  /**
   * The #pre_render callback for building a block.
   *
   * Renders the content using the provided block plugin, and then:
   * - if there is no content, aborts rendering, and makes sure the block won't
   *   be rendered.
   * - if there is content, moves the contextual links from the block content to
   *   the block itself.
   */
  public static function preRender($build) {
    $entity = $build['#app_module_info']['entity'];
    $path = $build['#app_module_info']['path'];
    $options = $build['#app_module_info']['options'];

    /* In the future this would get the app module router and determine
     * the controller & arguments from the path like routing.yml.
     */

    $content = $entity->getAppModulePlugin()->buildForRoute($path, $options);

    unset($build['#app_module_info']);

    $build['content'] = $content;

    return $build;
  }

}
