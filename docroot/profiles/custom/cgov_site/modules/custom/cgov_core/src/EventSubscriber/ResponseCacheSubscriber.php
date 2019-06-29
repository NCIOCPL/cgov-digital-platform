<?php

namespace Drupal\cgov_core\EventSubscriber;

use Drupal\Core\Config\ConfigFactory;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\FilterResponseEvent;

/**
 * Class to handle setting cache directives on some responses.
 *
 * Borrowed from https://git.drupalcode.org/project/http_cache_control.
 */
class ResponseCacheSubscriber implements EventSubscriberInterface {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactory
   */
  protected $configFactory;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Config\ConfigFactory $config_factory
   *   The config factory.
   */
  public function __construct(
    ConfigFactory $config_factory
  ) {
    $this->configFactory = $config_factory;
  }

  /**
   * Set http cache control headers.
   */
  public function setHeaderCacheControl(FilterResponseEvent $event) {
    $config = $this->configFactory->get('system.performance');

    $response = $event->getResponse();

    if (!$response->isCacheable()) {
      return;
    }

    $ttl = $this->getTtlForStatus($response->getStatusCode());

    if ($ttl == NULL) {
      return;
    }

    // Allow modules that set their own max age to retain it.
    // If a response max-age is different to the page max-age
    // then this suggests the max-age has already been manipulated.
    $max_age = $response->getMaxAge();
    if ($max_age != $config->get('cache.page.max_age')) {
      return;
    }

    // Set the TTL.
    $response->setClientTtl($ttl);
  }

  /**
   * Gets the TTL for a status code.
   *
   * @param string $status
   *   The status code.
   *
   * @return string
   *   The time to live as a string.
   */
  private function getTtlForStatus($status) {

    // There are lots of 500s.
    if ($status >= 500) {
      // Wait one minute.
      return "60";
    }

    // Hard coding for now.
    switch ($status) {
      case 404:
        // 5min is a good time to wait for a 404.
        return "300";

      case 302:
        // I get scared of 302 redirects, but hopefully the ones
        // that should not be cached are marked as such.
        return "300";

      case 301:
        // Note: 301s do actually pass back cache headers right now...
        // https://www.drupal.org/project/drupal/issues/3054821.
        return "1800";

      default:
        // If this is not one of these statuses, don't touch.
        return NULL;
    }

  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    // Response: set header content for security policy.
    $events[KernelEvents::RESPONSE][] = ['setHeaderCacheControl', -10];
    return $events;
  }

}
