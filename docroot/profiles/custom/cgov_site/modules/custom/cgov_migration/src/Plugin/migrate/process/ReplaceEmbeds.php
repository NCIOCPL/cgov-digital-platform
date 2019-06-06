<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * Replace percussion inline variants with Drupal embeds..
 *
 * @MigrateProcessPlugin(
 *   id = "replace_embeds"
 * )
 */
class ReplaceEmbeds extends CgovPluginBase {

  protected $migLog;
  protected $doc;

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    // Exit early if the field not set.
    if (!isset($value)) {
      return NULL;
    }

    $doc = $this->doc;
    $pid = $this->getPercID($row);

    $doc->html($value);
    $allDivs = $doc->getElementsByTagName('placeholder');
    for ($i = $allDivs->length - 1; $i >= 0; $i--) {
      $divNode = $allDivs->item($i);
      $sys_dependentvariantid = $divNode->getAttr('sys_dependentvariantid');

      // The embedded items ID.
      $sys_dependentid = $divNode->getAttr('sys_dependentid');

      if (!empty($sys_dependentvariantid)) {
        $this->migLog->logMessage($pid, 'Placeholder created for perc ID:' . $sys_dependentvariantid . ' on PID ' . $pid, E_NOTICE, $sys_dependentvariantid);

        // Populate the attributes for the Drupal embed.
        $embedAttributes = $this->getEmbedAttributes($sys_dependentvariantid);

        if (!empty($embedAttributes)) {
          $replacementEmbed = $this->createEmbedText($sys_dependentid, $embedAttributes);
          $divNode->parentNode->replaceChild($replacementEmbed, $divNode);
          $this->migLog->logMessage($pid, 'Embed replaced for perc ID: ' . $sys_dependentid, E_NOTICE, $sys_dependentvariantid);
        }
        else {
          // Put a error placeholder.
          $this->migLog->logMessage($pid, 'No embed mapping found for:' . $sys_dependentvariantid . ' on PID ' . $pid, E_ERROR, $sys_dependentvariantid);
          $replacementEmbed = $this->doc->createElement('drupal-entity', 'ERROR REPLACING ENTITY: ' . $sys_dependentid . ' With variant: ' . $sys_dependentvariantid);
          $divNode->parentNode->replaceChild($replacementEmbed, $divNode);

        }
      }
    }

    $body = $doc->find('body');
    $size = $body->count();
    if ($size > 0) {
      $value = $body->html();
    }

    return $value;
  }

  /**
   * Maps.
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
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloDsHighlightCenter.
      case '2238':

        $values['style'] = 'view_mode:media.infographic_display_article_large';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloDsHighlightRtMed.
      case '2246':

        $values['view_mode'] = 'view_mode:media.infographic_display_article_medium';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // VIDEOS
      // loSnVideo50NoTitleLeft.
      case '1835':

        $values['view_mode'] = 'view_mode:media.video_display_small_no_title';
        $values['data_align'] = 'left';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo100Title.
      case '1825':

        $values['view_mode'] = 'view_mode:media.video_display_large_title';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideoCarouselInline.
      case '2371':

        $values['view_mode'] = 'view_mode:media.full';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo50TitleRight.
      case '1833':

        $values['style'] = 'view_mode:media.video_display_small_title';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo100NoTitle.
      case '1823':

        $values['view_mode'] = 'view_mode:media.video_display_large_no_title';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo75NoTitle.
      case '1831':

        $values['view_mode'] = 'view_mode:media.video_display_medium_no_title';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo75Title.
      case '1841':

        $values['view_mode'] = 'view_mode:media.video_display_medium_title';
        $values['data_align'] = 'center';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // gloSnVideo50NoTitleRight.
      case '1839':

        $values['view_mode'] = 'view_mode:media.video_display_small_no_title';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'media_entity_embed';
        $values['data_entity_type'] = 'media';
        break;

      // FEATURE CARD.
      case '2388':
        $values['view_mode'] = 'view_mode:node.embedded_feature_card';
        $values['data_align'] = 'right';
        $values['data_embed_button'] = 'cgov_featured_content_button';
        $values['data_entity_type'] = 'node';
        break;

      // gloDsSnBody    S – Body.
      case '1998    ':
        $values['view_mode'] = 'view_mode:block_content.full';
        $values['data_align'] = '';
        $values['data_embed_button'] = 'insert_block_content';
        $values['data_entity_type'] = 'block_content';
        break;
    }

    return $values;
  }

  /**
   * Create a embed item to insert into text.
   *
   * @return string
   *   Returns the embed item for this entity.
   */
  public function createEmbedText($entity_id, $values) {

    $entity_storage = \Drupal::entityTypeManager()->getStorage($values['data_entity_type']);
    $entity = $entity_storage->load($entity_id);

    $element = $this->doc->createElement('drupal-entity');
    if (!empty($entity)) {
      $view_mode = !empty($values['view_mode']) ? $values['view_mode'] : NULL;
      $data_align = !empty($values['data_align']) ? $values['data_align'] : NULL;
      $data_caption = !empty($values['data_caption']) ? $values['data_caption'] : NULL;
      $data_embed_button = !empty($values['data_embed_button']) ? $values['data_embed_button'] : NULL;
      $data_entity_type = !empty($values['data_entity_type']) ? $values['data_entity_type'] : NULL;
      $attributes = [
        'data-embed-button' => $data_embed_button,
        'data-entity-embed-display' => $view_mode,
        'data-entity-type' => $data_entity_type,
        'data-entity-uuid' => $entity->get('uuid')->value,
      ];
      if (!empty($data_align)) {
        $attributes['data-align'] = $data_align;
      }
      $attributes['data-caption'] = $data_caption;

      foreach ($attributes as $key => $value) {
        $element->setAttribute($key, $value);

      }
    }
    else {
      $element = $this->doc->createElement('drupal-entity', 'ERROR REPLACING ENTITY: ' . $entity_id);
    }
    return $element;
  }

}
