<?php

namespace Drupal\cgov_image\Plugin\PathProcessor;

use Drupal\Core\Routing\ResettableStackedRouteMatchInterface;
use Drupal\Core\Render\BubbleableMetadata;
use Symfony\Component\HttpFoundation\Request;
use Drupal\Core\PathProcessor\OutboundPathProcessorInterface;
use Drupal\language\Entity\ConfigurableLanguage;

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
   * Constructor.
   *
   * @param \Drupal\Core\Routing\ResettableStackedRouteMatchInterface $currentRoute
   *   The current route.
   */
  public function __construct(ResettableStackedRouteMatchInterface $currentRoute) {
    $this->currentRoute = $currentRoute;
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

    // Redirect to the media type's underlying file.
    $file_uri = $entity->field_media_image->entity->getFileUri();
    $image_file_path = file_url_transform_relative(file_create_url($file_uri));
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
