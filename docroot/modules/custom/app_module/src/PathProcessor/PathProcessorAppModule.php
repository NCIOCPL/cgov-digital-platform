<?php

namespace Drupal\app_module\PathProcessor;

use Drupal\app_module\AppPathManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\PathProcessor\InboundPathProcessorInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

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
   * The request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * The Current Request.
   *
   * This is a cached version of the current request object.
   * Use currentRequest() to access it. This is to get around
   * circular dependencies.
   *
   * @var \Symfony\Component\HttpFoundation\Request|null
   */
  protected $currentRequest;

  /**
   * Constructs a PathProcessorAppModule object.
   *
   * @param \Drupal\app_module\AppPathManagerInterface $app_path_manager
   *   An app module path manager for looking up the alias.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request stack.
   */
  public function __construct(
    AppPathManagerInterface $app_path_manager,
    EntityTypeManagerInterface $entity_type_manager,
    RequestStack $request_stack,
  ) {
    $this->appPathManager = $app_path_manager;
    $this->entityTypeManager = $entity_type_manager;
    $this->requestStack = $request_stack;
  }

  /**
   * {@inheritdoc}
   *
   * Um, this gets called *a lot*. I mean lots of lots. Like every link
   * and file going through Drupal is hitting this code. By link, all the
   * possible editing links are included. So if you are requesting Node 11,
   * there will be a lot of /node/11 requests. Then there is the redirect
   * handler, which basically calls processInbound on each incoming link.
   *
   * Anyway, there are probably some optimizations for the future, like
   * skipping any .jpg/png/etc. OTOH, who knows if we will have an app
   * that is for viewing images and a .jpg/png/etc would be a valid
   * route.
   */
  public function processInbound($path, Request $request) {

    // processInbound can actually be called "to process requests other
    // than the current request. So we are doing this to actually make
    // sure we are being called for the current request. It seems checking
    // this probably will have some slight performance benefits.
    if ($request->getRequestUri() !== $this->currentRequest()->getRequestUri()) {
      return $path;
    }

    // Now that we know that this path is for the current request,
    // we should check to make sure that we have not already looked up
    // the path. If we have already, then just return it.
    if ($this->currentRequest()->attributes->get('cgov_app_module_owner_alias')) {
      // Return the loaded owner alias.
      return $this->currentRequest()->attributes->get('cgov_app_module_resolved_path');
    }

    // Lookup our app module path.
    $appPath = $this->appPathManager->getPathByRequest($path);

    // There is no module for this path.
    if (!$appPath) {
      // There is no module for this path, and there never will be. This is
      // really just a slight optimization since multiple handlers can actually
      // process the URL as incoming. So both the request and the currentRequest
      // will match, but actually the app module lookup would have already
      // occurred. (e.g., the redirect module's RequestHandler.)
      $this->currentRequest()->attributes->add(['cgov_app_module_resolved_path' => $path]);
      return $this->currentRequest()->attributes->get('cgov_app_module_resolved_path');
    }

    // Load the AppModule/plugin for this path so that we can extract the route
    // and parameters.
    $storage = $this->entityTypeManager->getStorage('app_module');

    /** @var \Drupal\app_module\AppModuleInterface */
    $entity = $storage->load($appPath['app_module_id']);
    /** @var \Drupal\app_module\Plugin\app_module\AppModulePluginInterface */
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
    $this->currentRequest()->attributes->add(['cgov_app_module_route' => $app_route['app_module_route']]);
    $this->currentRequest()->attributes->add(['cgov_app_module_data' => $appPath['app_module_data']]);
    $this->currentRequest()->attributes->add(['cgov_app_module_id' => $appPath['app_module_id']]);
    $this->currentRequest()->attributes->add(['cgov_app_module_resolved_path' => $appPath['owner_alias']]);

    // Add any additional params to the request object.
    foreach ($app_route['params'] as $param_name => $param_value) {
      $this->currentRequest()->query->add([$param_name => $param_value]);
    }

    // Return the alias of the parent entity.
    return $this->currentRequest()->attributes->get('cgov_app_module_resolved_path');
  }

  /**
   * Helper function to get current request object.
   *
   * This is here to get around circular dependency errors when
   * we set this via the constructor.
   */
  protected function currentRequest() {
    if (!$this->currentRequest) {
      $this->currentRequest = $this->requestStack->getCurrentRequest();
    }
    return $this->currentRequest;
  }

}
