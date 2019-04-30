<?php

namespace Drupal\cgov_core\EventSubscriber;

use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Event subscriber to handle untranslated URL requests.
 *
 * This class contains an event subscriber that will handle visitor requests
 * for untranslated items properly. (e.g. return 404) Drupal will display
 * English content when a requested node has not been translated and the UI
 * is set to a Spanish interface.
 *
 * @package Drupal\cgov_core
 */
class TranslationAvailableSubscriber implements EventSubscriberInterface {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\ResettableStackedRouteMatchInterface
   */
  protected $currentRoute;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Session\AccountInterface $current_user
   *   The current user.
   * @param \Drupal\Core\Routing\ResettableStackedRouteMatchInterface $current_route
   *   The current route.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager.
   */
  public function __construct(AccountInterface $current_user, ResettableStackedRouteMatchInterface $current_route, LanguageManagerInterface $language_manager) {
    $this->currentUser = $current_user;
    $this->currentRoute = $current_route;
    $this->languageManager = $language_manager;
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

    $valid_routes = [
      'entity.node.canonical',
      'entity.media.canonical',
    ];

    /* Check users permission?
     * So for no translation and no published translation, this
     * will never be a spanish item. To preview an unpublished
     * item you need to use the latest revision path.
     * Pathauto will not generate aliases for latest revision,
     * so you must always go to the latest revision route.
     */

    // We should probably only do this for certain routes.
    if (!in_array($this->currentRoute->getRouteName(), $valid_routes)) {
      return;
    }

    // Now that we are here, we are at the point where we should be
    // returning a 404 if we do not like what we see.
    $entity = $this->getCurrEntity();

    // This is not content, so this request does not apply.
    if (!$entity) {
      return;
    }

    $curr_lang = $this->languageManager->getCurrentLanguage()->getId();
    if ($entity->hasTranslation($curr_lang)) {
      return;
    }

    // We should return a 404.
    throw new NotFoundHttpException();
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
