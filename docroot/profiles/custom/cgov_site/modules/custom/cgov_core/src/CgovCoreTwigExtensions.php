<?php

namespace Drupal\cgov_core;

use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\image\Entity\ImageStyle;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Extend Drupal's Twig_Extension class.
 */
class CgovCoreTwigExtensions extends \Twig_Extension {

  /**
   * Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The current Request object.
   *
   * @var \Symfony\Component\HttpFoundation\Request
   */
  protected $requestStack;

  /**
   * The current language ID.
   *
   * @var string
   */
  protected $langid;

  /**
   * Constructs a new CgovNavigationManager class.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager, LanguageManagerInterface $languageManager, RequestStack $requestStack) {
    $this->entityTypeManager = $entityTypeManager;
    $this->languageManager = $languageManager;
    $this->requestStack = $requestStack;
    // Get current language.
    $this->langid = $this->languageManager->getCurrentLanguage()->getID();
  }

  /**
   * {@inheritdoc}
   */
  public function getName() {
    return 'cgov_core.CgovCoreTwigExtensions';
  }

  /**
   * {@inheritdoc}
   */
  public function getFunctions() {
    return [
      new \Twig_SimpleFunction('get_enclosure', [$this, 'getEnclosure'], ['is_safe' => ['html']]),
      new \Twig_SimpleFunction('get_list_description', [$this, 'getListDescription'], ['is_safe' => ['html']]),
      new \Twig_SimpleFunction('get_translated_absolute_path', [$this, 'getTranslatedAbsolutePath'], ['is_safe' => ['html']]),
    ];
  }

  /**
   * Generate <enclosure url='x' length='9' type='mime/type' /> tag from NID.
   *
   * Call this function with {{ get_enclosure(nid) }}
   *
   * @param int $nid
   *   Node ID to create enclosure tag from.
   *
   * @return string
   *   generated enclosure tag.
   */
  public function getEnclosure($nid) {
    // Set $debug=TRUE to show displayed image source in comments.
    $debug = FALSE;

    // Strip any theme debugging and cast to numeric.
    $nid = (int) strip_tags($nid);

    // Image style to use when rendering images.
    $thumbnail_image_style = 'cgov_thumbnail';

    // Load the node's translation, if available.
    $node = $this->entityTypeManager->getStorage('node')->load($nid);
    if ($node && $node->hasTranslation($this->langid)) {
      $node = $node->getTranslation($this->langid);
    }
    else {
      // No translation for this node, don't display it.
      return FALSE;
    }

    // Check for available images to display.
    $media_image_file = NULL;

    // Check if there is a lead image specified, if so use it.
    if ($node->hasField('field_image_article')) {
      $lead_media_field = $this->getTranslationIfExists($node->get('field_image_article')->entity);
      // Check if promo image is present.
      if ($lead_media_field) {
        $media_image_file = $this->getTranslationIfExists($lead_media_field->get('field_media_image')->entity);
        $displaying = 'article image';
        $displaying .= ' NODE/IMG/FILE:' . $node->language()->getID();
        $displaying .= '/' . ($lead_media_field ? $lead_media_field->language()->getID() : '');
        $displaying .= '/' . ($media_image_file ? $media_image_file->language()->getID() : '');

        // Check for overridden thumbnail image.
        $media_image_thumbnail_file = $this->getTranslationIfExists($lead_media_field->get('field_override_img_thumbnail')->entity);
        if ($media_image_thumbnail_file) {
          $media_image_file = $media_image_thumbnail_file;
          $displaying = 'lead thumbnail override image';
          $displaying .= ' NODE/IMG/FILE:' . $node->language()->getID();
          $displaying .= '/' . ($lead_media_field ? $lead_media_field->language()->getID() : '');
          $displaying .= '/' . ($media_image_file ? $media_image_file->language()->getID() : '');
        }
      }
    }

    // Check if there is a promotional image specified, if so use it.
    if ($node->hasField('field_image_promotional')) {
      $promo_media_field = $this->getTranslationIfExists($node->get('field_image_promotional')->entity);
      // Check if promo image is present.
      if ($promo_media_field) {
        $media_image_file = $this->getTranslationIfExists($promo_media_field->get('field_media_image')->entity);
        $displaying = 'promo image';
        $displaying .= ' NODE/IMG/FILE:' . $node->language()->getID();
        $displaying .= '/' . ($promo_media_field ? $promo_media_field->language()->getID() : '');
        $displaying .= '/' . ($media_image_file ? $media_image_file->language()->getID() : '');

        // Check for overridden thumbnail image.
        $media_image_thumbnail_file = $this->getTranslationIfExists($promo_media_field->get('field_override_img_thumbnail')->entity);
        if ($media_image_thumbnail_file) {
          $media_image_file = $media_image_thumbnail_file;
          $displaying = 'promo thumbnail override image';
          $displaying .= ' NODE/IMG/FILE:' . $node->language()->getID();
          $displaying .= '/' . ($lead_media_field ? $lead_media_field->language()->getID() : '');
          $displaying .= '/' . ($media_image_file ? $media_image_file->language()->getID() : '');
        }
      }
    }

    if (!$media_image_file) {
      if ($debug) {
        $displaying = 'NO IMAGE';
      }
      return FALSE;
    }

    // Get URI of media image file (eg: public://2019-03/image.jpg).
    $image_uri = $media_image_file->getFileUri();

    // Generate new derivative image from imagestyle.
    /** @var \Drupal\image\Entity\ImageStyle $imagestyle */
    $imagestyle = ImageStyle::load($thumbnail_image_style);
    // Get thumbnail_uri
    // (eg: public://styles/cgov_thumbail/public/2019-03/image.jpg).
    $thumbnail_uri = $imagestyle->buildUri($image_uri);
    // Create the styled image on the filesystem
    // (needed to find final file size and mime type).
    $imagestyle->createDerivative($image_uri, $thumbnail_uri);
    // Convert 'public://path/image.jpg'
    // to '/sites/default/files/path/image.jpg'.
    $relative_imagestyle_uri = file_url_transform_relative(file_create_url($thumbnail_uri));
    // Remove querystring, if present (eg: path/image.jpg?h=98765az)
    $relative_imagestyle_uri = strtok($relative_imagestyle_uri, '?');
    // Add HTTP scheme (HTTP[S]) and hostname.
    $absolute_imagestyle_url = $this->requestStack->getCurrentRequest()->getSchemeAndHttpHost() . ltrim(base_path(), '/') . $relative_imagestyle_uri;

    // Get the filesystem path (not web path) to the imagestyle
    // file so we can get filesize.
    $imagestyle_filename = realpath(".") . $relative_imagestyle_uri;
    $styled_file_size = filesize($imagestyle_filename);
    $styled_mime_type = image_type_to_mime_type(exif_imagetype($imagestyle_filename));

    $enclosure = "<enclosure url='$absolute_imagestyle_url' length='$styled_file_size' type='$styled_mime_type' />";

    if ($debug) {
      $enclosure .= "<!-- image source: $displaying -->";
    }

    return $enclosure;
  }

  /**
   * Select either the List Description or the Page/Meta Description.
   *
   * Call this function with {{ get_list_description (nid) }}
   *
   * @param int $nid
   *   Node ID to load description from.
   *
   * @return string
   *   selected description.
   */
  public function getListDescription($nid) {
    // Strip any theme debugging and cast to numeric.
    $nid = (int) strip_tags($nid);

    // Load the node's translation, if available.
    $node = $this->entityTypeManager->getStorage('node')->load($nid);
    if ($node && $node->hasTranslation($this->langid)) {
      $node = $node->getTranslation($this->langid);
    }
    else {
      return FALSE;
    }

    // Check for available descriptions to display.
    if ($node->hasField('field_page_description')) {
      $description = $node->field_page_description->value;
    }
    if ($node->hasField('field_list_description') && !$node->field_list_description->isEmpty()) {
      $description = $node->field_list_description->value;
    }
    return $description;
  }

  /**
   * Get the translated path to the node.
   *
   * Call this function with {{ get_translated_path(nid) }}.
   * This is a workaround to the many Core issues about views not returning the
   * proper path for translations:
   * https://www.drupal.org/project/drupal/issues/2877994
   * https://www.drupal.org/project/drupal/issues/2957917
   * https://www.drupal.org/project/drupal/issues/2862511
   * https://www.drupal.org/project/drupal/issues/2802311
   * etc.
   *
   * @param int $nid
   *   Node ID to load description from.
   *
   * @return string
   *   Path to node.
   */
  public function getTranslatedAbsolutePath($nid) {
    // Strip any theme debugging and cast to numeric.
    $nid = (int) strip_tags($nid);

    // Load the node's translation, if available.
    $node = $this->getTranslationIfExists($this->entityTypeManager->getStorage('node')->load($nid));
    if ($node && $node->hasTranslation($this->langid)) {
      $node = $node->getTranslation($this->langid);
    }
    else {
      return FALSE;
    }

    // Verify node was found.
    if (!$node) {
      return FALSE;
    }

    // Get translated absolute link.
    $link = $node->toUrl('canonical', ['absolute' => TRUE])->toString();

    return $link;
  }

  /**
   * Get the translated version of entity, if available.
   */
  private function getTranslationIfExists($entity) {
    if ($entity && $entity->hasTranslation($this->langid)) {
      $entity = $entity->getTranslation($this->langid);
    }
    return $entity;
  }

}
