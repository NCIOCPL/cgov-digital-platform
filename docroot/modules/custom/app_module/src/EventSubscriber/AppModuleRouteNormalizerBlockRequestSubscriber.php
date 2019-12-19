<?php

namespace Drupal\app_module\EventSubscriber;

use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

/**
 * Prevents Route Normalization for App Modules.
 *
 * The normalization should be disabled by setting the
 * "_disable_route_normalizer" request parameter to TRUE. This should be done
 * before onKernelRequestRedirect() method is executed and only if the
 * "app_module_route" query parameter is present.
 */
class AppModuleRouteNormalizerBlockRequestSubscriber implements EventSubscriberInterface {

  /**
   * Sets the disable route normalizer flag if app module request.
   *
   * @param \Symfony\Component\HttpKernel\Event\GetResponseEvent $event
   *   The Event to process.
   */
  public function onKernelRequest(GetResponseEvent $event) {
    $request = $event->getRequest();

    if ($request->query->get('app_module_route')) {
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
