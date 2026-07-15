<?php

namespace Drupal\cgov_event\Controller;

use Drupal\Core\Cache\CacheableResponse;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Datetime\DrupalDateTime;
use Drupal\Core\Entity\EntityStorageInterface;
use Drupal\Core\Session\AccountProxy;
use Eluceo\iCal\Component\Calendar;
use Eluceo\iCal\Component\Event;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * The iCalendar controller.
 */
class ICalendarController extends ControllerBase {

  /**
   * {@inheritdoc}
   */
  protected $entity;
  /**
   * {@inheritdoc}
   */
  protected $currentUser;
  /**
   * {@inheritdoc}
   */
  public $request;

  /**
   * Constructs an ICalendar Controller object.
   *
   * @param \Drupal\Core\Entity\EntityStorageInterface $entityStorage
   *   The node storage.
   * @param \Drupal\Core\Session\AccountProxy $currentUser
   *   The current user.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request
   *   The request stack.
   */
  public function __construct(EntityStorageInterface $entityStorage, AccountProxy $currentUser, RequestStack $request) {
    $this->entity = $entityStorage;
    $this->currentUser = $currentUser;
    $this->request = $request;
  }

  /**
   * Create dependency injection.
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('entity_type.manager')->getStorage('node'),
      $container->get('current_user'),
      $container->get('request_stack'),
    );

  }

  /**
   * Generates an iCalendar file for a given event node.
   */
  public function download($nid) {
    // Use the injected storage property instead of entityTypeManager lookup.
    /** @var \Drupal\node\NodeInterface */
    $node = $this->entity->load($nid);

    if ($node === NULL || $node->bundle() !== 'cgov_event' || !$node->isPublished()) {
      $message = '';
      $error_code = 400;

      if ($node === NULL) {
        $message = 'iCalendar download failed: requested Node ID @nid does not exist.';
        $error_code = 404;
      }
      elseif ($node->bundle() !== 'cgov_event') {
        $message = 'iCalendar download failed: requested Node ID @nid is not a cgov_event bundle.';
        $error_code = 400;
      }
      elseif (!$node->isPublished()) {
        $message = 'iCalendar download failed: requested Node ID @nid is unpublished.';
        // Security Obfuscation: Return a 404 so public users
        // can't guess that an unreleased draft exists.
        $error_code = 404;
      }

      $this->getLogger('cgov_event')->warning($message, ['@nid' => $nid]);

      $error_html = '<h1>iCalendar Error</h1><p>iCalendar Error, please contact the System Administrator</p>';
      $response = new CacheableResponse($error_html, $error_code, ['Content-Type' => 'text/html; charset=utf-8']);
      // Attach the node dependency so the cache instantly clears
      // the second an editor hits "Publish" in the admin panel.
      if ($node !== NULL) {
        $response->addCacheableDependency($node);
      }

      return $response;
    }
    $start_date = NULL;
    $end_date = NULL;

    // Check if the All Day Event flag is checked.
    $is_all_day = $node->hasField('field_all_day_event') && (bool) $node->get('field_all_day_event')->value;

    if ($node->hasField('field_event_start_date') && !$node->get('field_event_start_date')->isEmpty()) {
      $raw_start = $node->get('field_event_start_date')->value;
      $date = new DrupalDateTime($raw_start, 'UTC');
      $start_date = $date->format('Y-m-d H:i:s');
    }

    if ($node->hasField('field_event_end_date') && !$node->get('field_event_end_date')->isEmpty()) {
      $raw_end = $node->get('field_event_end_date')->value;
      $date = new DrupalDateTime($raw_end, 'UTC');
      $end_date = $date->format('Y-m-d H:i:s');
    }

    // Get Host.
    $host = $this->request->getCurrentRequest()->getHost();

    // 1. Create a Calendar object.
    $vCalendar = new Calendar($host);

    // 2. Create an Event object.
    $vEvent = new Event();

    // 3. Add information to the Event.
    if ($start_date) {
      $vEvent->setDtStart(new \DateTime($start_date, new \DateTimeZone('UTC')));
    }
    if ($end_date) {
      $vEvent->setDtEnd(new \DateTime($end_date, new \DateTimeZone('UTC')));
    }

    // Tell the library to format properties
    // as VALUE=DATE instead of VALUE=DATE-TIME.
    if ($is_all_day) {
      $vEvent->setNoTime(TRUE);
    }

    // MANDATORY RFC 5545 REQUIREMENT: Set a unique ID for calendar tracking.
    $vEvent->setUniqueId('cgov-event-' . $nid . '@' . $host);

    $vEvent->setSummary($node->getTitle());

    if ($node->hasField('field_city_state') && !$node->get('field_city_state')->isEmpty()) {
      $vEvent->setLocation($node->get('field_city_state')->value);
    }

    if ($node->hasField('field_page_description') && !$node->get('field_page_description')->isEmpty()) {
      $vEvent->setDescription($node->get('field_page_description')->value);
    }

    // 4. Add Event to Calendar.
    $vCalendar->addComponent($vEvent);

    // 5. Render directly to string.
    $content = $vCalendar->render();
    $filename = 'cal-' . $nid . '.ics';

    // 6. Return an in-memory HTTP response.
    $headers = [
      'Content-Type' => 'text/calendar; charset=utf-8',
      'Content-Disposition' => 'attachment; filename="' . $filename . '"',
    ];

    $response = new CacheableResponse($content, 200, $headers);
    $response->addCacheableDependency($node);
    return $response;
  }

}
