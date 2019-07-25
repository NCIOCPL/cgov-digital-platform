<?php

namespace Drupal\cgov_file\EventSubscriber;

use Drupal\akamai\Event\AkamaiHeaderEvents;
use Drupal\Core\Config\ConfigFactoryInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\RequestStack;
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
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The Service Container.
   *
   * Purge is not a required module and therefore we cannot pass in the
   * TagsHeadersServiceInterface. So we must probe for the service from
   * the service container in order to get it out.
   *
   * @var \Symfony\Component\DependencyInjection\ContainerInterface
   */
  protected $serviceContainer;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   * @param \Drupal\Core\Routing\ResettableStackedRouteMatchInterface $current_route
   *   The current route.
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request object.
   * @param \Drupal\Core\Config\ConfigFactoryInterface $configFactory
   *   The configuration factory.
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $serviceContainer
   *   Service Container.
   */
  public function __construct(
      EntityTypeManagerInterface $entity_type_manager,
      ResettableStackedRouteMatchInterface $current_route,
      RequestStack $request_stack,
      ConfigFactoryInterface $configFactory,
      ContainerInterface $serviceContainer
  ) {
    $this->entityTypeManager = $entity_type_manager;
    $this->currentRoute = $current_route;
    $this->requestStack = $request_stack;
    $this->configFactory = $configFactory;
    $this->serviceContainer = $serviceContainer;
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

    // Or item does not exist on disk.
    if (!file_exists($uri)) {
      throw new NotFoundHttpException("The file {$uri} does not exist.");
    }

    $response = new BinaryFileResponse($uri);

    // Add response header so we can indicate to any upstream CDN that
    // this file can change its contents at any point. i.e. don't let
    // end users cache it.
    $response->headers->set('X-CGDP-Managed-File', 'true');

    // Add cache tags because a BinaryFileResponse does not implement
    // CacheableResponseInterface, and therefore it is our duty to
    // manage anything cache related -- Drupal and Purge will not.
    // Code below lifted from Purge's CacheableResponseSubscriber.
    $tags = $entity->getCacheTags();
    $this->addCacheTags($response, $tags);

    // Set the max age for our CDN friends. I mean, if we have a cache
    // tag then we can clear it, right?
    $perfConfig = $this->configFactory->get('system.performance');
    $maxAge = $perfConfig->get('cache.page.max_age');
    $response->setMaxAge($maxAge);

    if ($this->doNotIndex($entity)) {
      $response->headers->set('X-Robots-Tag', 'noindex');
    }

    $event->setResponse($response);

  }

  /**
   * Add optional cache tag headers.
   *
   * @param \Symfony\Component\HttpFoundation\BinaryFileResponse $response
   *   The response object to add the headers to.
   * @param array $tags
   *   The tags to add.
   */
  private function addCacheTags(BinaryFileResponse $response, array $tags) {
    $this->addPurgeCacheTags($response, $tags);
    $this->addAkamaiCacheTags($response, $tags);
  }

  /**
   * Add optional cache tag headers if purge is enabled.
   *
   * @param \Symfony\Component\HttpFoundation\BinaryFileResponse $response
   *   The response object to add the headers to.
   * @param array $tags
   *   The tags to add.
   */
  private function addPurgeCacheTags(BinaryFileResponse $response, array $tags) {
    if ($this->serviceContainer->has('purge.tagsheaders')) {
      // @var Drupal\purge\Plugin\Purge\TagsHeader\TagsHeadersServiceInterface;
      $purgeTagsHeaders = $this->serviceContainer->get('purge.tagsheaders');

      foreach ($purgeTagsHeaders as $header) {

        // Retrieve the header name perform a few simple sanity checks.
        $name = $header->getHeaderName();
        if ((!is_string($name)) || empty(trim($name))) {
          $plugin_id = $header->getPluginId();
          throw new \LogicException("Header plugin '$plugin_id' should return a non-empty string on ::getHeaderName()!");
        }

        $response->headers->set($name, $header->getValue($tags));
      }
    }
  }

  /**
   * Adds the Akamai cache tags if Akamai is enabled.
   *
   * Akamai has purge integrations, but does not use purge to add in
   * the cache tags header. Therefore we need to copy even MORE logic
   * than just purge. Oh and see if Akamai is installed. Boo! Bad
   * Akamai module!
   *
   * @param \Symfony\Component\HttpFoundation\BinaryFileResponse $response
   *   The response object to add the headers to.
   * @param array $tags
   *   The tags to add.
   */
  private function addAkamaiCacheTags(BinaryFileResponse $response, array $tags) {

    // Check if Akamai is enabled.
    if ($this->serviceContainer->has('akamai.client.manager')) {

      // Get Akamai Required Services.
      // @var \Drupal\akamai\Helper\CacheTagFormatter
      $tagFormatter = $this->serviceContainer->get('akamai.helper.cachetagformatter');
      // @var \Symfony\Component\EventDispatcher\EventDispatcherInterface
      $eventDispatcher = $this->serviceContainer->get('event_dispatcher');

      $config = $this->configFactory->get('akamai.settings');
      $header = $config->get('edge_cache_tag_header');
      if ($header) {
        $blacklist = $config->get('edge_cache_tag_header_blacklist');
        $blacklist = is_array($blacklist) ? $blacklist : [];

        $filtered_tags = array_filter($tags, function ($tag) use ($blacklist) {
          foreach ($blacklist as $prefix) {
            if (strpos($tag, $prefix) !== FALSE) {
              return FALSE;
            }
          }
          return TRUE;
        });

        // Instantiate our event to allow tag modification.
        $event = new AkamaiHeaderEvents($filtered_tags);
        $eventDispatcher->dispatch(AkamaiHeaderEvents::HEADER_CREATION, $event);

        // Format the modified tags and add them as a header.
        $modified_tags = $event->data;
        foreach ($modified_tags as &$tag) {
          $tag = $tagFormatter->format($tag);
        }
        $response->headers->set('Edge-Cache-Tag', implode(',', $modified_tags));

      }
    }
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
