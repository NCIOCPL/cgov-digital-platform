<?php

namespace Drupal\cgov_core;

use Drupal\Core\Entity\EntityTypeManagerInterface;
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
   * The current Request object.
   *
   * @var \Symfony\Component\HttpFoundation\Request
   */
  protected $requestStack;

  /**
   * Constructs a new CgovNavigationManager class.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager, RequestStack $requestStack) {
    $this->entityTypeManager = $entityTypeManager;
    $this->requestStack = $requestStack;
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
    ];
  }

  /**
   * Generate <enclosure url='x' length='9' type='mime/type' /> tag from NID.
   *
   * Call this function with {{ get_enclosure(node.nid)|raw }}
   *
   * @param int $nid
   *   Node ID to create enclosure tag from.
   *
   * @return string
   *   generated enclosure tag.
   */
  public function getEnclosure($nid) {
    $thumbnail_image_style = 'cgov_thumbnail';

    $node = $this->entityTypeManager->getStorage('node')->load($nid);
    if (!$node) {
      return FALSE;
    }

    if ($node->hasField('field_image_article')) {
      $displaying = 'article';
      $media_field = $node->get('field_image_article')->entity;
      $media_image_file = $media_field->get('field_media_image')->entity;
    }

    if ($node->hasField('field_image_promotional')) {
      $displaying = 'promo';
      $media_field = $node->get('field_image_article')->entity;
      $media_image_file = $media_field->get('field_media_image')->entity;
    }

    // Get URI of media image file (eg: public://2019-03/image.jpg)
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
    // Add HTTP scheme (HTTP[S]) and hostname.
    $absolute_imagestyle_url = $this->requestStack->getCurrentRequest()->getSchemeAndHttpHost() . base_path() . $relative_imagestyle_uri;

    // Get the filesystem path (not web path) to the imagestyle
    // file so we can get filesize.
    $imagestyle_filename = realpath(".") . $relative_imagestyle_uri;
    $styled_file_size = filesize($imagestyle_filename);
    $styled_mime_type = image_type_to_mime_type(exif_imagetype($imagestyle_filename));

    $enclosure = "<enclosure url='$absolute_imagestyle_url' length='$styled_file_size' type='$styled_mime_type' data-imagetype='$displaying' />";

    return $enclosure;
  }

}
