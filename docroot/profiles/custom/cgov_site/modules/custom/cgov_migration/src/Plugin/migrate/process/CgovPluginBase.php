<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateSkipRowException;
use DOMWrap\Document;

/**
 * Base plugin class for Cgov Migration.
 */
abstract class CgovPluginBase extends ProcessPluginBase {

  protected $migLog;
  protected $doc;

  protected $skippedVariants = [
    2487 => 'cgvDsListNoTitleDescriptionImage',
    2489 => 'cgvDsListNoTitleDescriptionNoImage',
    2539 => 'nvcgSnImageCarouselCenter',
  ];

  /**
   * {@inheritdoc}
   */
  public function __construct() {
    $this->migLog = \Drupal::service('cgov_migration.migration_logger');
    $this->doc = new Document();

  }

  /**
   * Return the incoming percussion ID from the Row.
   */
  public function getPercId($row) {
    if ($row->hasSourceProperty('para_id')) {
      $pid = $row->getSource()['para_id'];
    }
    elseif ($row->hasSourceProperty('id')) {
      $pid = $row->getSource()['id'];
    }
    elseif ($row->hasSourceProperty('citation_id')) {
      $pid = $row->getSource()['citation_id'];
    }
    elseif ($row->hasSourceProperty('row_rid')) {
      $pid = $row->getSource()['row_rid'];
    }
    else {
      $message = "Item skipped due to missing id or para_id.";
      $this->migLog->logMessage(NULL, $message, E_ERROR);

      throw new MigrateSkipRowException();
    }

    return $pid;
  }

  /**
   * Maps variants to view modes and embed attributes.
   */
  public function getEmbedAttributes($sys_dependentvariantid) {
    $values = NULL;
    switch ($sys_dependentvariantid) {

      // IMAGES
      // 2066    gloDsArticleImgRtMed    D - Article Image Right Medium.
      case '2066':
        $values['view_mode'] = 'view_mode:media.image_display_article_medium';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // 2082    gloDsArticleImgCenter    D - Article Image Center.
      case '2082':
        $values['view_mode'] = 'view_mode:media.image_display_article_large';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // 2084    gloDsArticleImgCtrFull    D - Article Image Center Full.
      case '2084':

        $values['view_mode'] = 'view_mode:media.image_display_article_full';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // 2086    gloDsArticleImgLeftMed    D - Article Image Left Medium.
      case '2086':

        $values['view_mode'] = 'view_mode:media.image_display_article_medium';
        $values['data_align'] = 'left';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // 2088    gloDsArticleImgLeftSm    D - Article Image Left Small.
      case '2088':

        $values['view_mode'] = 'view_mode:media.image_display_article_small';
        $values['data_align'] = 'left';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // 2090    gloDsArticleImgRtSm    D - Article Image Right Small.
      case '2090':

        $values['view_mode'] = 'view_mode:media.image_display_article_small';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // INFOGRAPHICS
      // gloDsHighlightRtSm.
      case '2250':

        $values['view_mode'] = 'view_mode:media.infographic_display_article_medium';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'cgov_infographic_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloDsHighlightCenter.
      case '2238':

        $values['view_mode'] = 'view_mode:media.infographic_display_article_large';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'cgov_infographic_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloDsHighlightRtMed.
      case '2246':

        $values['view_mode'] = 'view_mode:media.infographic_display_article_medium';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'cgov_infographic_button';
        $values['data_entity_type'] = 'media';
        break;

      // VIDEOS
      // loSnVideo50NoTitleLeft.
      case '1835':

        $values['view_mode'] = 'view_mode:media.video_display_small_no_title';
        $values['data_align'] = 'left';
        $values['data_embed_button'] = 'cgov_video_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo100Title.
      case '1825':

        $values['view_mode'] = 'view_mode:media.video_display_large_title';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'cgov_video_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideoCarouselInline.
      case '2371':

        $values['view_mode'] = 'view_mode:media.full';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'cgov_video_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo50TitleRight.
      case '1833':

        $values['view_mode'] = 'view_mode:media.video_display_small_title';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'cgov_video_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo100NoTitle.
      case '1823':

        $values['view_mode'] = 'view_mode:media.video_display_large_no_title';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'cgov_video_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo75NoTitle.
      case '1831':

        $values['view_mode'] = 'view_mode:media.video_display_medium_no_title';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'cgov_video_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo75Title.
      case '1841':

        $values['view_mode'] = 'view_mode:media.video_display_medium_title';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'cgov_video_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo50NoTitleRight.
      case '1839':

        $values['view_mode'] = 'view_mode:media.video_display_small_no_title';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'cgov_video_button';
        $values['data_entity_type'] = 'media';
        break;

      // nvcgDsFeatureCardRight      D - Feature Card Right.
      case '2388':
        $values['view_mode'] = 'view_mode:node.embedded_feature_card';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'cgov_featured_content_button';
        $values['data_entity_type'] = 'node';
        break;

      // gloDsSnBody    S – Body.
      case '1998':
        $values['view_mode'] = 'view_mode:block_content.full';
        $values['data_align'] = '';
        $values['data_embed_button'] = 'insert_block_content';
        $values['data_entity_type'] = 'block_content';
        break;

      // gloSnRawHTML    S – Raw HTML Content Block.
      case '1712':
        $values['view_mode'] = 'view_mode:block_content.full';
        $values['data_align'] = '';
        $values['data_embed_button'] = 'insert_block_content';
        $values['data_entity_type'] = 'block_content';
        break;

      // INLINE IMAGES.
      // gloBnUtilityImage    B - Utility Image.
      case '2254':
        $values['view_mode'] = 'view_mode:media.image_display_inline';
        $values['data_align'] = '';
        $values['data_embed_button'] = 'cgov_image_button';
        $values['data_entity_type'] = 'media';
        break;

      // gloBnImage    B - Image1.
      case '1482':

        $values['view_mode'] = 'view_mode:media.image_display_inline';
        $values['data_align'] = '';
        $values['data_embed_button'] = 'cgov_image_button';
        $values['data_entity_type'] = 'media';
        break;

      // nciBnImage    B - NCI Image .
      case '917':

        $values['view_mode'] = 'view_mode:media.image_display_inline';
        $values['data_align'] = '';
        $values['data_embed_button'] = 'cgov_image_button';
        $values['data_entity_type'] = 'media';
        break;

    }

    return $values;
  }

  /**
   * Returns and entity of an unknown type.
   *
   * Percussion items have a one to one mapping to Drupal so there should be no
   * overlap in terms of node and media entity_ids. We are assuming
   * the incoming ID belongs to one entity type and not both.
   */
  protected function getEntityOfUnknownType($entity_id) {

    $entity_storage = \Drupal::entityTypeManager()->getStorage('node');
    $entity = $entity_storage->load($entity_id);

    // Try to load the id as a media item otherwise.
    if (empty($entity)) {
      $entity_storage = \Drupal::entityTypeManager()->getStorage('media');
      $entity = $entity_storage->load($entity_id);
    }

    return $entity;
  }

}
