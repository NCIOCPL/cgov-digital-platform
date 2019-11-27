<?php

namespace Drupal\app_module\PathProcessor;

use Drupal\app_module\AppPathManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\PathProcessor\InboundPathProcessorInterface;
use Symfony\Component\HttpFoundation\Request;

/**
 * Defines a path processor to setup app module routes and support pushstate.
 *
 * This module will extract the app module routes and parameters from a
 * requested URL. It will then write the path to the alias of the app_module's
 * parent entity (Node) so that Drupal can handle the normal entity (Node)
 * loading process. This app module should be before, and as close to the
 * \Drupal\Core\PathProcessor\PathProcessorAlias processor's priority as
 * possible.
 */
class PathProcessorAppModule implements InboundPathProcessorInterface {

  /**
   * The app module path manager.
   *
   * @var \Drupal\app_module\AppPathManagerInterface
   */
  protected $appPathManager;

  /**
   * Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs a PathProcessorAppModule object.
   *
   * @param \Drupal\app_module\AppPathManagerInterface $app_path_manager
   *   An app module path manager for looking up the alias.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(AppPathManagerInterface $app_path_manager, EntityTypeManagerInterface $entity_type_manager) {
    $this->appPathManager = $app_path_manager;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * {@inheritdoc}
   */
  public function processInbound($path, Request $request) {

    // Lookup our app module path.
    $appPath = $this->appPathManager->getPathByRequest($path);

    // There is no module for this path.
    if (!$appPath) {
      return $path;
    }

    // Load the AppModule/plugin for this path so that we can extract the route
    // and parameters.
    $storage = $this->entityTypeManager->getStorage('app_module');

    /* @var \Drupal\app_module\AppModuleInterface */
    $entity = $storage->load($appPath['app_module_id']);
    /* @var \Drupal\app_module\Plugin\app_module\AppModulePluginInterface */
    $plugin = $entity->getAppModulePlugin();

    // Clear up any trailing slashes.
    $clean_path = rtrim($path, '/');

    // If we are an exact match to the alias, then we are the "root" url (/).
    // Otherwise we just need to lob off the alias.
    $appRoute = ($clean_path === $appPath['owner_alias']) ?
                '/' :
                substr($clean_path, strlen($appPath['owner_alias']));

    // If there was a trailing slash added to the alias, then let the
    // Drupal normalizers redirect. If they don't redirect, then no
    // bother - if a app_module_path is not set in the request object
    // then we assume it is the / route anyway. We will not forcefully
    // redirect app routes with trailing slashes unless it becomes an
    // actual issue. It is kind of a hard problem to solve...
    if ($appRoute === '/' && $path !== $clean_path) {
      return $path;
    }

    // Get the app route information.
    $app_route = $plugin->matchRoute($appRoute, (array) $appPath['app_module_data']);

    // According to the app module plugin, there is no route for this
    // path, so we return the original requested URL so Drupal can either
    // load a different entity (Node) or return a 404.
    if (!$app_route) {
      return $path;
    }

    // Set the app_module_route parameter so the AppModuleRenderArrayBuilder
    // can pass it off to the plugin for rendering.
    $request->query->add(['app_module_route' => $app_route['app_module_route']]);
    $request->query->add(['app_module_data' => $appPath['app_module_data']]);
    $request->query->add(['app_module_id' => $appPath['app_module_id']]);

    // Add any additional params to the request object.
    foreach ($app_route['params'] as $param_name => $param_value) {
      $request->query->add([$param_name => $param_value]);
    }

    // Return the alias of the parent entity.
    return $appPath['owner_alias'];
  }

}
