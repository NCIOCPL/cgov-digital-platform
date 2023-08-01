<?php

namespace Drupal\cgov_image;

use Drupal\image\Entity\ImageStyle;

/**
 * Class CgovImageTwigExtensions.
 */
class CgovImageTwigExtensions extends \Twig_Extension {

  /**
   * A list with all the defined functions. The first parameter is the name
   * by which we will call the function. The second parameter is the
   * name of the function that will implement the function.
   */
  public function getFunctions() {
    return [
      new \Twig_SimpleFunction('get_placeholder_image', [$this, 'getPlaceholderImage']),
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
    $absolute_path = \Drupal::service('file_url_generator')->transformRelative($image_style->buildUrl($uri));
    return $absolute_path;
  }

}
