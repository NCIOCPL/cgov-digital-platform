<?php

namespace Drupal\cgov_image\Plugin\PathProcessor;

use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\PathProcessor\OutboundPathProcessorInterface;
use Drupal\language\Entity\ConfigurableLanguage;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\file\FileInterface;
use Drupal\media\MediaInterface;

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

    $entity = $this->getCurrEntity();

    if (!$entity) {
      return $path;
    }

    $prohibitedBundles = [
      'cgov_image',
      'cgov_contextual_image',
    ];

    $bundle = $entity->bundle();

    if (!in_array($bundle, $prohibitedBundles)) {
      return $path;
    }
    // We don't want '/espanol' getting tacked on
    // to a file path. We'll create a language object for
    // english to prevent any language processors using
    // the interface or content language to append /espanol
    // to the front of the file path.
    $languageObject = ConfigurableLanguage::createFromLangcode('en');
    $options['language'] = $languageObject;
    if (!($entity instanceof MediaInterface)) {
      // $path retuns /media/{id}
      return $path;
    }
    // Redirect to the media type's underlying file.
    $file_entity = $entity->field_media_image->entity;
    if (!($file_entity instanceof FileInterface)) {
      return $path;
    }
    $file_uri = $file_entity->getFileUri();
    $image_file_path = $this->fileUrlGenerator->generateString($file_uri);
    return $image_file_path;
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
