<?php

namespace Drupal\cgov_image;

use Drupal\image\Entity\ImageStyle;
use Drupal\cgov_image\CgovImageTools;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;
use Drupal\Core\File\FileUrlGeneratorInterface;

/**
 * Class CgovImageTwigExtensions.
 */
class CgovImageTwigExtensions extends AbstractExtension {

  /**
   * The file URL generator.
   *
   * @var \Drupal\Core\File\FileUrlGeneratorInterface
   */
  protected $fileUrlGenerator;

  /**
   * Constructor.
   *
   * @param \Drupal\Core\File\FileUrlGeneratorInterface $file_url_generator
   *   File url generator.
   */
  public function __construct(FileUrlGeneratorInterface $file_url_generator) {
    $this->fileUrlGenerator = $file_url_generator;
  }

  /**
   * A list with all the defined functions. The first parameter is the name
   * by which we will call the function. The second parameter is the
   * name of the function that will implement the function.
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
    $image_style = ImageStyle::load($image_style);
    $absolute_path = $this->fileUrlGenerator->transformRelative($image_style->buildUrl($uri));
    return $absolute_path;
  }

}
