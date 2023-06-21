<?php

namespace Drupal\cgov_image;

use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Cgov Image Twig Extensions.
 */
class CgovImageTwigExtensions extends AbstractExtension {

  /**
   * The file URL generator.
   *
   * @var \Drupal\Core\File\FileUrlGeneratorInterface
   */
  protected $fileUrlGenerator;

  /**
   * The Get EntityTypeManagerInterface.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs \Drupal\Core\Template\TwigExtension.
   *
   * @param \Drupal\Core\File\FileUrlGeneratorInterface $file_url_generator
   *   The file URL generator.
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   Get entity_type_manager.
   */
  public function __construct(FileUrlGeneratorInterface $file_url_generator, EntityTypeManagerInterface $entity_type_manager) {
    $this->fileUrlGenerator = $file_url_generator;
    $this->entityTypeManager = $entity_type_manager;
  }

  /**
   * A list with all the defined functions.
   */
  public function getFunctions() {
    return [
      new TwigFunction('get_placeholder_image', [$this, 'getPlaceholderImage']),
    ];
  }

  /**
   * Returns the extension name.
   */
  public function getName() {
    return 'cgov_image.CgovImageTwigExtensions';
  }

  /**
   * Function that returns an example text with a color passed as a parameter.
   */
  public function getPlaceholderImage($image_style) {
    $test = new CgovImageTools();
    $crop = $test->findCropByStyle($image_style);
    $uri = 'module://cgov_image/img/placeholder-' . $crop . '.png';
    $image_style = $this->entityTypeManager->getStorage('image_style')->load($image_style);
    $absolute_path = $this->fileUrlGenerator->transformRelative($image_style->buildUrl($uri));
    return $absolute_path;
  }

}
