<?php

namespace Drupal\cgov_image;

/**
 * A service which provides methods to alter and configure form elements.
 */
class CgovImageTools {

  /**
   * Helper function to get the crop name from the image style.
   *
   * @param string $image_style
   *   The image_style to find the crop for.
   *
   * @return string
   *   NULL if the style does not have a crop, the name of the crop otherwise.
   */
  public function findCropByStyle($image_style) {
    // TODO: Actually find the crop from the style.
    switch ($image_style) {
      case "cgov_article":
      case "cgov_enlarged":
        return "freeform";

      case "cgov_featured":
      case "cgov_social_media":
      case "ncids_featured_4x3":
        return "4x3";

      case "cgov_panoramic":
      case "ncids_featured_16x9":
      case "ncids_promo_16x9":
      case "ncids_guide_card_16x9":
        return "16x9";

      case "cgov_thumbnail":
        return "thumbnail";

      case "cgov_borderless_card":
      case "ncids_promo_1x1":
        return "1x1";
    }
    return NULL;
  }

}
