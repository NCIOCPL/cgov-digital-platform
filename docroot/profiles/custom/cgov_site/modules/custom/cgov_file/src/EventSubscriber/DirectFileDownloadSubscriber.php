<?php

namespace Drupal\cgov_file\EventSubscriber;

use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpFoundation\ResponseHeaderBag;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\HttpKernel\Event\GetResponseEvent;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Event subscriber to handle direct downloads for file aliases requests.
 *
 * The media canonical route (i.e. /media/{media}) displays a web page with
 * the link to the file. We need to make it so that when a user requests the
 * alias, the file is sent to the user.
 *
 * A lot of this logic was borrowed from
 * https://www.drupal.org/project/media_entity_download, but that used a
 * controller with a different route. I thought about a RouteSubscriber to
 * replace the view route, but that route applies to *all* media. This only
 * affects files and seemed a bit more straightforward. This also has to be
 * dynamic because we need to return a X-Robots-Tag HTTP Header if it has
 * been marked as do not index.
 *
 * @package Drupal\cgov_file
 */
class DirectFileDownloadSubscriber implements EventSubscriberInterface {

  /**
   * The Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\ResettableStackedRouteMatchInterface
   */
  protected $currentRoute;

  /**
   * Symfony\Component\HttpFoundation\RequestStack definition.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Routing\ResettableStackedRouteMatchInterface $current_route
   *   The current route.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request object.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, ResettableStackedRouteMatchInterface $current_route, RequestStack $request_stack) {
    $this->entityTypeManager = $entity_type_manager;
    $this->currentRoute = $current_route;
    $this->requestStack = $request_stack;
  }

  /**
   * {@inheritdoc}
   */
  public static function getSubscribedEvents() {
    $events[KernelEvents::REQUEST] = ['onRequest'];
    return $events;
  }

  /**
   * Handles the request, and serves out the content.
   *
   * @param \Symfony\Component\HttpKernel\Event\GetResponseEvent $event
   *   The event data.
   */
  public function onRequest(GetResponseEvent $event) {

    if ($this->currentRoute->getRouteName() !== 'entity.media.canonical') {
      return;
    }

    // Get the entity for the request.
    $entity = $this->getCurrEntity();

    // This is not content, so this request does not apply.
    if (!$entity || $entity->bundle() != 'cgov_file') {
      return;
    }

    // This is a file, so we should try and serve it up to
    // the visitor.
    // If a delta was provided, use that.
    $delta = $this->requestStack->getCurrentRequest()->query->get('delta');

    // Get the ID of the requested file by its field delta.
    if (is_numeric($delta)) {
      $values = $entity->field_media_file->getValue();

      if (isset($values[$delta])) {
        $fid = $values[$delta]['target_id'];
      }
      else {
        throw new NotFoundHttpException("The requested file could not be found.");
      }
    }
    else {
      $fid = $entity->field_media_file->target_id;
    }

    // If media has no file item.
    if (!$fid) {
      throw new NotFoundHttpException("The media item requested has no file referenced/uploaded.");
    }

    $file = $this->entityTypeManager->getStorage('file')->load($fid);

    // Or file entity could not be loaded.
    if (!$file) {
      throw new \Exception("File id {$fid} could not be loaded.");
    }

    $uri = $file->getFileUri();
    $filename = $file->getFilename();

    // Or item does not exist on disk.
    if (!file_exists($uri)) {
      throw new NotFoundHttpException("The file {$uri} does not exist.");
    }

    $response = new BinaryFileResponse($uri);

    if ($this->doNotIndex($entity)) {
      $response->headers->set('X-Robots-Tag', 'noindex');
    }

    $response->setContentDisposition(
      ResponseHeaderBag::DISPOSITION_ATTACHMENT,
      $filename
    );

    $event->setResponse($response);

  }

  /**
   * Determines if the file should not be indexed by search engines.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   The file.
   *
   * @return bool
   *   TRUE if it should not be index, FALSE if it is ok to index.
   */
  private function doNotIndex(ContentEntityInterface $entity) {
    if (!$entity->hasField('field_search_engine_restrictions')) {
      return FALSE;
    }

    $restriction = $entity->get('field_search_engine_restrictions')->getValue();

    if ($restriction[0]['value'] == 'ExcludeSearch') {
      return TRUE;
    }
  }

  /**
   * Gets the current entity if there is one.
   *
   * @return \Drupal\Core\Entity\ContentEntityInterface
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
