<?php

namespace Drupal\cgov_image\EventSubscriber;

use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Event subscriber to handle media/{id} route requests.
 *
 * Return a 404 for attempts to directly access an image or
 * contextual image media route.
 *
 * @package Drupal\cgov_core
 */
class ImageEventSubscriber implements EventSubscriberInterface {

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\ResettableStackedRouteMatchInterface
   */
  protected $currentRoute;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Routing\ResettableStackedRouteMatchInterface $current_route
   *   The current route.
   */
  public function __construct(ResettableStackedRouteMatchInterface $current_route) {
    $this->currentRoute = $current_route;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST] = ['onRequest'];
    return $events;
  }

  /**
   * Validates that this request can be handled.
   *
   * @param \Symfony\Component\HttpKernel\Event\GetResponseEvent $event
   *   The event data.
   */
  public function onRequest(GetResponseEvent $event) {

    // We should probably only do this for certain routes.
    if ($this->currentRoute->getRouteName() !== 'entity.media.canonical') {
      return;
    }

    // Now that we are here, we are at the point where we should be
    // returning a 404 if we do not like what we see.
    $entity = $this->getCurrEntity();

    // This is not content, so this request does not apply.
    if (!$entity) {
      return;
    }

    $prohibitedBundles = [
      'cgov_image',
      'cgov_contextual_image',
    ];

    $bundle = $entity->bundle();

    if (in_array($bundle, $prohibitedBundles)) {
      // We should return a 404.
      throw new NotFoundHttpException();
    }

  }

  /**
   * Gets the current entity if there is one.
   *
   * @return Drupal\Core\Entity\ContentEntityInterface
   *   The retrieved entity, or FALSE if none found.
   */
  private function getCurrEntity() {
    $params = $this->currentRoute->getParameters()->all();
    foreach ($params as $param) {
      if (!is_object($param)) {
        continue;
      }

      $class = new \ReflectionClass($param);

      if (in_array('Drupal\Core\Entity\ContentEntityInterface', $class->getInterfaceNames())) {
        // If you find a ContentEntityInterface stop iterating and return it.
        return $param;
      }
    }
    return FALSE;
  }

}
