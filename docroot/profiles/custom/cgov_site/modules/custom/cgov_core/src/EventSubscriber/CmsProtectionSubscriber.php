<?php

namespace Drupal\cgov_core\EventSubscriber;

use Drupal\Core\Extension\ModuleHandler;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Routing\UrlGeneratorInterface;
use Drupal\Core\Session\AccountInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;

/**
 * Event subscriber to handle requiring logins for protecting the CMS.
 *
 * This class will require logins when accessing the *-cms hosts, and
 * unless on local, disallow logins for non *-cms hosts.
 *
 * @package Drupal\cgov_core
 */
class CmsProtectionSubscriber implements EventSubscriberInterface {

  /**
   * The current user.
   *
   * @var \Drupal\Core\Session\AccountInterface
   */
  protected $currentUser;

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\RouteMatchInterface
   */
  protected $currentRoute;

  /**
   * The Url Generator.
   *
   * @var \Drupal\Core\Routing\UrlGeneratorInterface
   */
  protected $urlGenerator;

  /**
   * The Module Handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandler
   */
  protected $moduleHandler;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Session\AccountInterface $current_user
   *   The current user.
   * @param \Drupal\Core\Routing\RouteMatchInterface $current_route
   *   The current route.
   * @param \Drupal\Core\Routing\UrlGeneratorInterface $url_generator
   *   A URL Generator.
   * @param \Drupal\Core\Extension\ModuleHandler $module_handler
   *   A URL Generator.
   */
  public function __construct(
    AccountInterface $current_user,
    RouteMatchInterface $current_route,
    UrlGeneratorInterface $url_generator,
    ModuleHandler $module_handler
  ) {
    $this->currentUser = $current_user;
    $this->currentRoute = $current_route;
    $this->urlGenerator = $url_generator;
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    // Make sure this occurs before dynamic page cache and after auth.
    $events[KernelEvents::REQUEST] = ['onRequest', 30];
    return $events;
  }

  /**
   * Forces users to login, or hides login.
   *
   * @param \Symfony\Component\HttpKernel\Event\GetResponseEvent $event
   *   The event data.
   */
  public function onRequest(GetResponseEvent $event) {

    // Check the host.
    $request = $event->getRequest();

    $full_host = $request->getHost();
    $full_host_arr = explode('.', $full_host);
    $shortname = $full_host_arr[0];

    if (preg_match('/.*-cms(-.*|)$/i', $shortname)) {
      /* This is a CMS host to be protected */
      $this->redirectToLogin($event);
    }
  }

  /**
   * Redirects the user to the login page.
   *
   * @param \Symfony\Component\HttpKernel\Event\GetResponseEvent $event
   *   The event data.
   */
  private function redirectToLogin(GetResponseEvent $event) {
    if ($this->currentUser->isAnonymous() && !$this->isLoginRoute()) {
      // This is not a login route, so take them there.
      // TODO: Set the user back to the original route.
      $url = $this->getLoginUrl();
      $response = new RedirectResponse($url, 302);
      $event->setResponse($response);
      // Do not cache this!
      $response->setPrivate();
      $response->setMaxAge(0);
      $response->setSharedMaxAge(0);
      $response->headers->addCacheControlDirective('must-revalidate', TRUE);
      $response->headers->addCacheControlDirective('no-store', TRUE);
      $event->stopPropagation();
    }

  }

  /**
   * Determines if this is a login route.
   *
   * @return bool
   *   TRUE if it is a login route, FALSE if not.
   */
  private function isLoginRoute() {
    return (
      $this->currentRoute->getRouteName() == 'user.login' ||
      $this->currentRoute->getRouteName() == 'simplesamlphp_auth.saml_login'
    );
  }

  /**
   * Gets the correct login path to redirect the unauthenticated user to.
   *
   * @return string
   *   The URL to send the user.
   */
  private function getLoginUrl() {
    if ($this->moduleHandler->moduleExists('simplesamlphp_auth')) {
      // Send to SSO login.
      $url = $this->urlGenerator->generateFromRoute('simplesamlphp_auth.saml_login');
    }
    else {
      // Send to normal drupal login form.
      $url = $this->urlGenerator->generateFromRoute('user.login');
    }

    return $url;
  }

}
