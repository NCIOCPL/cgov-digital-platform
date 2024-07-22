<?php

namespace Drupal\cgov_image\Plugin\PathProcessor;

use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\PathProcessor\OutboundPathProcessorInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;
use Drupal\Core\Url;
use Drupal\file\FileInterface;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\media\Entity\Media;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Redirect media/{image} request to raw file.
 */
class ImageRedirectProcessor implements OutboundPathProcessorInterface {

  /**
   * The route matcher.
   *
   * @var \Drupal\Core\Routing\ResettableStackedRouteMatchInterface
   */
  protected $currentRoute;

  /**
   * The file URL generator.
   *
   * @var \Drupal\Core\File\FileUrlGeneratorInterface
   */
  protected $fileUrlGenerator;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\Routing\ResettableStackedRouteMatchInterface $currentRoute
   *   The current route.
   * @param \Drupal\Core\File\FileUrlGeneratorInterface $file_url_generator
   *   File url generator.
   */
  public function __construct(ResettableStackedRouteMatchInterface $currentRoute, FileUrlGeneratorInterface $file_url_generator) {
    $this->currentRoute = $currentRoute;
    $this->fileUrlGenerator = $file_url_generator;
  }

  /**
   * {@inheritdoc}
   */
  public function processOutbound($path, &$options = [], Request $request = NULL, BubbleableMetadata $bubbleable_metadata = NULL) {

    // Is this the current version, an older one, or some other route?
    $routename = $this->currentRoute->getRouteName();
    switch ($routename) {
      case 'entity.media.canonical':
        $entity = $this->currentRoute->getParameter('media');
        break;

      case 'entity.media.revision':
        $entity = $this->currentRoute->getParameter('media_revision');
        break;

      case 'entity.media.latest_version':
        $entity = $this->currentRoute->getParameter('media');
        break;

      default:
        return $path;
    }

    if ($entity === NULL ||
      !($entity instanceof Media) ||
      ($entity->bundle() !== 'cgov_image' && $entity->bundle() !== 'cgov_contextual_image')
    ) {
      return $path;
    }

    // Attempts to edit the 'latest revision' are set to the regular editing
    // page, which is pretty much the same thigng anyhow.
    if ($routename === 'entity.media.latest_version') {
      return $this->getEditingPath($entity);
    }
    else {
      return $this->getEntityFilepath($entity);
    }

  }

  /**
   * Helper method to get the file path of an entity object.
   *
   * @param mixed $entity
   *   The media item to find the path of.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
   *
   * @return string
   *   The path to where the physical file is located.
   */
  private function getEntityFilepath($entity) {
    // We don't want '/espanol' getting tacked on
    // to a file path. We'll create a language object for
    // english to prevent any language processors using
    // the interface or content language to append /espanol
    // to the front of the file path.
    $languageObject = ConfigurableLanguage::createFromLangcode('en');
    $options['language'] = $languageObject;

    // Redirect to the media type's underlying file.
    $file_entity = $entity->field_media_image->entity;
    if (!($file_entity instanceof FileInterface)) {
      // What to do if the file is NULL or not the right type?
      throw new NotFoundHttpException('Media item is missing primary image.');
    }

    // URL encoding happens in UrlGenerator.php line 314 [rawurlencode].
    // We need to make sure that we are returning the unencoded file path
    // and there does not seem to be a way to generate an unencoded file
    // path. This is a hack to allow us to obtain an unencoded path.
    // Note: calling the $this->fileUrlGenerator->generate($uri)->getUri()
    // returns an unencoded path with base: within our file path. Using
    // the generate function would require us to remove base: from the path.
    $image_file_path = urldecode($file_entity->createFileUrl());
    return $image_file_path;
  }

  /**
   * Helper method to look up a media item's appropriate editor.
   *
   * @param mixed $entity
   *   The media item to be edited.
   *
   * @return string
   *   The path, relative to the server root, of the file.
   */
  private function getEditingPath($entity) {
    global $base_path;

    $joiner = str_ends_with($base_path, '/') ? '' : '/';
    $url = Url::fromRoute('entity.media.edit_form', ['media' => $entity->id()]);
    return $base_path . $joiner . $url->getInternalPath();
  }

}
