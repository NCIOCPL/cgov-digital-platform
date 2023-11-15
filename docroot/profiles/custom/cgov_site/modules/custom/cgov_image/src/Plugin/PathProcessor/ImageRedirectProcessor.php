<?php

namespace Drupal\cgov_image\Plugin\PathProcessor;

use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\PathProcessor\OutboundPathProcessorInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;
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

    if ($this->currentRoute->getRouteName() !== 'entity.media.canonical') {
      return $path;
    }

    $entity = $this->currentRoute->getParameter('media');
    if ($entity === NULL ||
      !($entity instanceof Media) ||
      ($entity->bundle() !== 'cgov_image' && $entity->bundle() !== 'cgov_contextual_image')
    ) {
      return $path;
    }

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

    $file_uri = $file_entity->getFileUri();
    $image_file_path = $this->fileUrlGenerator->generateString($file_uri);
    return $image_file_path;
  }

}
