<?php

namespace Drupal\cgov_image;

/**
 * A service which provides methods to alter and configure form elements.
 */
class CgovImageTools {

  /**
   * The stale embed button ID left over from the Percussion migration.
   */
  const LEGACY_IMAGE_EMBED_BUTTON = 'media_entity_embed';

  /**
   * The embed button ID that is actually configured on this platform.
   */
  const CURRENT_IMAGE_EMBED_BUTTON = 'cgov_image_button';

  /**
   * Rewrites migrated embedded-image markup to use the real embed button.
   *
   * Content migrated from Percussion stores inline images with
   * data-embed-button="media_entity_embed", a button ID that was never
   * actually configured on this platform. Entity Embed resolves its
   * "Edit" dialog by loading the embed_button config entity named in that
   * attribute, so editing these images errors out because no such config
   * entity exists. Swapping in the real button ID lets the dialog resolve.
   *
   * @param string $text
   *   The field value to rewrite.
   *
   * @return string
   *   The rewritten field value.
   */
  public function fixLegacyImageEmbedButton(string $text): string {
    return str_replace(
      'data-embed-button="' . self::LEGACY_IMAGE_EMBED_BUTTON . '"',
      'data-embed-button="' . self::CURRENT_IMAGE_EMBED_BUTTON . '"',
      $text
    );
  }

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
    // @todo Actually find the crop from the style.
    switch ($image_style) {
      case "cgov_article":
      case "cgov_enlarged":
        return "freeform";

      case "cgov_featured":
      case "cgov_social_media":
      case "ncids_collections_media_4x3":
      case "ncids_image_para_4x3":
        return "4x3";

      case "cgov_panoramic":
      case "ncids_featured_16x9":
      case "ncids_promo_16x9":
      case "ncids_guide_card_16x9":
      case "ncids_image_para_16x9":
        return "16x9";

      case "cgov_thumbnail":
        return "thumbnail";

      case "cgov_borderless_card":
      case "ncids_promo_1x1":
      case "ncids_guide_card_1x1":
      case "ncids_image_para_1x1":
      case "ncids_profile_box_1x1":
        return "1x1";
    }
    return NULL;
  }

}
