<?php

/**
 * @file
 * Cgov metatag tokens.
 */

use Drupal\crop\Entity\Crop;

/**
 * Implements hook_token_info().
 */
function cgov_metatag_token_info() {
  $info = [];
  $info['types']['cgov_tokens'] = ['name' => t('Cancer.gov Tokens'), 'description' => t('Cancer.gov Tokens')];

  $info['tokens']['cgov_tokens']['cgov-title'] =
        [
          'name' => t('Cgov Title Meta Tag'),
          'description' => t('The value to user for the title meta tag.'),
        ];

  $info['tokens']['cgov_tokens']['cgov-og-image'] =
        [
          'name' => t('Cgov og:image Metatag'),
          'description' => t('The value to user for the title meta tag.'),
        ];
  return $info;
}

/**
 * Implements hook_tokens().
 */
function cgov_metatag_tokens($type, $tokens, array $data, array $options, $bubbleable_metadata) {
  $replacements = [];
  if ($type == 'cgov_tokens') {
    foreach ($tokens as $name => $original) {
      switch ($name) {
        case 'cgov-title':
          $replacements[$original] = get_meta_title_token($data);
          break;

        case 'cgov-og-image':
          $replacements[$original] = get_meta_og_image_token($data);
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
    if (!$media_entity->get('field_override_img_social_media')->isEmpty()) {

      // Get the Social Media Image.
      $image_fid = $media_entity->field_override_img_social_media->target_id;
      $file_storage = \Drupal::entityTypeManager()->getStorage('file');
      $file = $file_storage->load($image_fid);

      // Get the Image URL.
      $file_uri = $file->getFileUri();
      $image_url_token = file_url_transform_relative(file_create_url($file_uri));

    }
    // Use the normal image if cropped with social media crop.
    else {
      $image_fid = $media_entity->field_media_image->target_id;
      $image_url_token = find_styled_image_url($image_fid, $social_img_style_name);
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

      $image_url = file_url_transform_relative($style->buildUrl($file_uri));

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
