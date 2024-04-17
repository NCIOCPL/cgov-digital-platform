<?php

/**
 * @file
 * Cgov metatag tokens.
 */

use Drupal\Core\Site\Settings;
use Drupal\crop\Entity\Crop;

/**
 * Implements hook_token_info().
 */
function cgov_metatag_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] =
        [
          'name' => t('Cancer.gov Tokens'),
          'description' => t('Cancer.gov Tokens'),
        ];

  $info['tokens']['cgov_tokens']['cgov-title'] =
        [
          'name' => t('Cgov Title Meta Tag'),
          'description' => t('The value to user for the title meta tag.'),
        ];

  $info['tokens']['cgov_tokens']['cgov-og-image'] =
        [
          'name' => t('Cgov og:image Metatag'),
          'description' => t('The value to use for the og:image meta tag.'),
        ];

  $info['tokens']['cgov_tokens']['cgov-trans-org-name'] =
        [
          'name' => t('Translated Org Name'),
          'description' => t('The value to use for the org name (translated if another language.'),
        ];

  $info['tokens']['cgov_tokens']['cgov-og-site-name'] =
        [
          'name' => t('Cgov og:site_name Meta Tag'),
          'description' => t('The value to use for the og:site_name meta tag.'),
        ];
  $info['tokens']['cgov_tokens']['cgov-media-content-language'] =
        [
          'name' => t('Cgov Media content-language Meta Tag'),
          'description' => t('The value to use for the media content-language meta tag.'),
        ];
  $info['tokens']['cgov_tokens']['cgdp-domain'] =
        [
          'name' => t('CGDP Domain'),
          'description' => t('The value to use for meta tag.'),
        ];
  $info['tokens']['cgov_tokens']['browser-title-site-name-meta'] =
        [
          'name' => t('Browser title Site Name Meta'),
          'description' => t('The value to use for meta tag.'),
        ];
  $info['tokens']['cgov_tokens']['browser-title-site-name'] =
        [
          'name' => t('Browser title Site Name'),
          'description' => t('The value to use for site name.'),
        ];
  $info['tokens']['cgov_tokens']['browser-title-site-name-custom'] =
        [
          'name' => t('Browser Custom title Site Name'),
          'description' => t('The value return custom title for site name.'),
        ];
  $info['tokens']['cgov_tokens']['browser-title-site-name-default'] =
        [
          'name' => t('Browser title Site Name Default'),
          'description' => t('The value to use for default site name.'),
        ];
  return $info;
}

/**
 * Implements hook_tokens().
 */
function cgov_metatag_tokens($type, $tokens, array $data, array $options, $bubbleable_metadata) {
  $replacements = [];
  $siteBrandingConfig = \Drupal::config('sitebranding.settings');
  $token_service = \Drupal::token();
  if ($type == 'cgov_tokens') {
    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'cgov-title':
          $replacements[$original] = get_meta_title_token($data);
          break;

        case 'cgov-og-image':
          $replacements[$original] = get_meta_og_image_token($data);
          break;

        case 'cgov-trans-org-name':
          $replacements[$original] = t('NCI');
          break;

        case 'cgov-og-site-name':
          $replacements[$original] = get_meta_og_site_name_token(t('National Cancer Institute'));
          break;

        case 'cgov-media-content-language':
          $replacements[$original] = get_media_meta_content_language_token($data);
          break;

        case 'cgdp-domain':
          $replacements[$original] = Settings::get('cgdp_domain');
          break;

        case 'browser-title-site-name-custom':
          $replacements[$original] = $siteBrandingConfig->get('custom_site_title_value');
          break;

        case 'browser-title-site-name-default':
          $replacements[$original] = t('NCI');
          break;

        case 'browser-title-site-name':
          $value = '';
          if ($siteBrandingConfig->get('browser_display_type') === 'default') {
            $value = $token_service->replace('[cgov_tokens:browser-title-site-name-default]');
          }
          elseif ($siteBrandingConfig->get('browser_display_type') === 'custom_title') {
            $value = $token_service->replace('[cgov_tokens:browser-title-site-name-custom]');
          }
          $replacements[$original] = $value;
          break;

        case 'browser-title-site-name-meta':
          if (!empty($siteName = $token_service->replace('[cgov_tokens:browser-title-site-name]'))) {
            $replacements[$original] = ' - ' . $siteName;
          }
          else {
            $replacements[$original] = '';
          }

          break;
      }
    }
  }
  return $replacements;
}

/**
 * Retrieves the desired metatag title.
 */
function get_meta_title_token(array $data) {

  // Get the entity from the appropriate data key.
  if (!empty($data['node'])) {
    $entity = $data['node'];
  }
  elseif (!empty($data['media'])) {
    $entity = $data['media'];
  }

  $titleToken = "";

  if (!empty($entity)) {

    if ($entity->hasField('field_browser_title') && !$entity->get('field_browser_title')->isEmpty()) {

      $titleToken = $entity->get('field_browser_title')->getValue()[0]['value'];
    }
  }
  return $titleToken;
}

/**
 * Retrieves the desired og:image url.
 */
function get_meta_og_image_token(array $data) {

  // Get the entity from the appropriate data key.
  if (!empty($data['node'])) {
    $entity = $data['node'];
  }
  elseif (!empty($data['media'])) {
    $entity = $data['media'];
  }

  if (empty($entity)) {
    return;
  }

  $image_url_token = NULL;

  // Return the URL for the promo image, otherwise use the lead image, if set.
  if ($entity->hasField('field_image_promotional') && !$entity->get('field_image_promotional')->isEmpty()) {
    $media_entity = $entity->get('field_image_promotional')->entity;

    // Get the token.
    $image_url_token = get_social_image_path_from_media($media_entity);
  }
  elseif ($entity->hasField('field_image_article') && !$entity->get('field_image_article')->isEmpty()) {
    $media_entity = $entity->get('field_image_article')->entity;

    // Get the token.
    $image_url_token = get_social_image_path_from_media($media_entity);
  }

  return $image_url_token;
}

/**
 * Return the social media image url based on cgov logic.
 *
 * @param object $media_entity
 *   The media entity containing the image.
 *
 * @return string
 *   THe URL of the image
 */
function get_social_image_path_from_media($media_entity) {

  try {
    $social_img_style_name = 'cgov_social_media';
    // Use the Social Image Override if set.
    if ($media_entity) {
      if (!$media_entity->get('field_override_img_social_media')->isEmpty()) {

        // Get the Social Media Image.
        $image_fid = $media_entity->field_override_img_social_media->target_id;
        $file_storage = \Drupal::entityTypeManager()->getStorage('file');
        $file = $file_storage->load($image_fid);

        // Get the Image URL.
        $file_uri = $file->getFileUri();
        $image_url_token = \Drupal::service('file_url_generator')->generateString($file_uri);

      }
      // Use the normal image if cropped with social media crop.
      else {
        $image_fid = $media_entity->field_media_image->target_id;

        // If there is no target, then return nothing.
        if (!$image_fid) {
          \Drupal::logger('cgov_metatag')->warning("Media Entity is missing required field_media_image: " . $media_entity->id());
          return NULL;
        }
        $image_url_token = find_styled_image_url($image_fid, $social_img_style_name);
      }
    }
    else {
      $image_url_token = NULL;
    }

  }
  catch (Exception $e) {
    // Generic exception handling if something gets thrown.
    \Drupal::logger('cgov_metatag')->error($e->getMessage());
    $image_url_token = NULL;
  }

  return $image_url_token;
}

/**
 * Return the relative url for a given image file and image style.
 *
 * @param int $image_fid
 *   The image fid.
 * @param string $social_img_style_name
 *   The name of the imagestyle.
 *
 * @return string
 *   THe URL of the image
 */
function find_styled_image_url($image_fid, $social_img_style_name) {

  try {
    // Get the image style.
    $style = \Drupal::entityTypeManager()->getStorage('image_style')->load($social_img_style_name);

    $file_storage = \Drupal::entityTypeManager()->getStorage('file');
    $file = $file_storage->load($image_fid);

    // The file id points to a non-existant file entity.
    if (!$file) {
      \Drupal::logger('cgov_metatag')->notice("Unable to load social media file id: " . $image_fid);
      return NULL;
    }

    $file_uri = $file->getFileUri();

    // Find the Crop associated with this ImageStyle.
    $image_helper = \Drupal::service('cgov_image.image_tools');
    $crop = $image_helper->findCropByStyle($social_img_style_name);

    // Return NULL token if there is no social media crop for this item.
    if (!Crop::cropExists($file_uri, $crop)) {
      $image_url = NULL;
    }
    else {
      // Get the relative URL for this image style binary.
      $derivative_uri = $style->buildUri($file_uri);

      // If the derivative doesn't exist yet create it.
      if (!file_exists($derivative_uri)) {
        $style->createDerivative($file_uri, $derivative_uri);
      }

      $image_url = \Drupal::service('file_url_generator')->transformRelative($style->buildUrl($file_uri));

      // Strip the tokens as they're not desired.
      $image_url = strtok($image_url, "?");

    }
  }
  catch (\Exception  $e) {
    // Generic exception handling if something gets thrown.
    \Drupal::logger('cgov_image')->error($e->getMessage());
    $image_url = NULL;
  }
  return $image_url;
}

/**
 * Sets up og_site_name metatag value.
 */
function get_meta_og_site_name_token(string $transOrgName) {
  // phpcs:disable
  $name = t(\Drupal::config('system.site')->get('name'));
  // phpcs:enable

  if ($transOrgName != $name) {
    $ogSiteName = $name . " - " . $transOrgName;
    return $ogSiteName;
  }
  else {
    return $name;
  }
}

/**
 * Sets up media-langcode metatag value.
 */
function get_media_meta_content_language_token(array $data) {

  // Get the entity from the appropriate data key.
  if (!empty($data['media'])) {
    $entity = $data['media'];
  }

  if (empty($entity)) {
    return;
  }

  $langcode = $entity->get('langcode')->value;

  return $langcode;
}
