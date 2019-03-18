<?php

namespace Drupal\cgov_core;

use Drupal\Core\Entity\EntityTypeManagerInterface;

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
   * Constructs a new CgovNavigationManager class.
   */
  public function __construct(EntityTypeManagerInterface $entityTypeManager) {
    $this->entityTypeManager = $entityTypeManager;
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
    $node = $this->entityTypeManager->getStorage('node')->load($nid);
    if (!$node) {
      return FALSE;
    }

    if ($node->hasField('field_image_article')) {
      $media_field_article = $node->get('field_image_article')->entity;
      $media_image_file = $media_field_article->get('field_media_image')->entity;
    }

    if ($node->hasField('field_image_promotional')) {
      $media_field_promo = $node->get('field_image_article')->entity;
      $media_image_file = $media_field_promo->get('field_media_image')->entity;
    }

    $file_mime_type = $media_image_file->getMimeType();
    $file_size = $media_image_file->getSize();

    $image_uri = $media_image_file->uri->value;
    $image_url = file_create_url($image_uri);

    $enclosure = "<enclosure url='$image_url' length='$file_size' type='$file_mime_type' />";

    return $enclosure;
  }

}
