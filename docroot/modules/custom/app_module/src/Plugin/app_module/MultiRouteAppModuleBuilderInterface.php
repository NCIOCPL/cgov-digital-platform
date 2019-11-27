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
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @see hook_page_attachments()
   */
  public function alterPageAttachments(array &$attachments, array $options = []);

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
   * @param array $options
   *   The settings for this instance of the AppModule on an entity.
   *
   * @see hook_tokens()
   */
  public function alterTokens(array &$replacements, array $context, array $options = []);

  /**
   * Gets the list of metadata tokens for this app module to alter.
   *
   * @return array
   *   Returns an array with the tokens that this app module should alter.
   */
  public function getTokensForAltering(array $options = []);

}
