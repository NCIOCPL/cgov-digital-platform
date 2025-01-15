<?php

namespace Drupal\app_module\EventSubscriber;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpKernel\KernelEvents;

/**
 * Prevents Route Normalization for App Modules.
 *
 * The normalization should be disabled by setting the
 * "_disable_route_normalizer" request parameter to TRUE. This should be done
 * before onKernelRequestRedirect() method is executed and only if the
 * "cgov_app_module_route" attribute parameter is present.
 */
class AppModuleRouteNormalizerBlockRequestSubscriber implements EventSubscriberInterface {

  /**
   * Sets the disable route normalizer flag if app module request.
   *
   * @param \Symfony\Component\HttpKernel\Event\RequestEvent $event
   *   The response event, which contains the current request.
   */
  public function onKernelRequest(RequestEvent $event) {
    $request = $event->getRequest();

    if ($request->attributes->get('cgov_app_module_route')) {
      $request->attributes->set('_disable_route_normalizer', TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    // Note RouteNormalizerRequestSubscriber's priority is 30, so we
    // must be at least 31 to make sure we are called before.
    $events[KernelEvents::REQUEST][] = ['onKernelRequest', 31];
    return $events;
  }

}
