<?php

namespace Drupal\app_module\Plugin\app_module;

/**
 * Interface for creating builders for Multi Route app modules.
 *
 * @see MultiRouteAppModuleBuilderBase
 */
interface MultiRouteAppModuleBuilderInterface {

  /**
   * Gets the id for this builder.
   *
   * @return string
   *   The machine id of this builder.
   */
  public function id();

  /**
   * Generates the build for this "screen".
   *
   * @param array $options
   *   The app module instance options.
   *
   * @return array
   *   The render array for this screen.
   */
  public function build(array $options);

  /**
   * Gets the cache information for this "screen".
   *
   * @param array $options
   *   The app module instance options.
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
   *
   *   NOTE: The cache contexts for this build should not differ from the
   *   other builders of this app module. This is because in essence, the
   *   output of the app module will be considered the same, and the context
   *   is what tells it how that entity can have different output.
   */
  public function getCacheInfo(array $options);

}
