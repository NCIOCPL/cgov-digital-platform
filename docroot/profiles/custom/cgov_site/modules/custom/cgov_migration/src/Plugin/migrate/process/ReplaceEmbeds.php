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

    // Temp.
    $allDivs = $doc->getElementsByTagName('div');
    for ($i = $allDivs->length - 1; $i >= 0; $i--) {
      $divNode = $allDivs->item($i);

      $sys_dependentvariantid = $divNode->getAttr('sys_dependentvariantid');
      if (!empty($sys_dependentvariantid)) {
        $this->migLog->logMessage($pid, 'Placeholder exists for perc ID:' . $sys_dependentvariantid . ' on PID ' . $pid, E_NOTICE, $sys_dependentvariantid);

      }
    }

    $doc->html($value);
    $allDivs = $doc->getElementsByTagName('div');
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
          $replacementEmbed = $this->createMediaEmbedText($sys_dependentid, $embedAttributes);
          $divNode->parentNode->replaceChild($replacementEmbed, $divNode);
          $this->migLog->logMessage($pid, 'Embed replaced for perc ID: ' . $sys_dependentid, E_NOTICE, $sys_dependentvariantid);
        }
        else {
          $this->migLog->logMessage($pid, 'No embed mapping found for:' . $sys_dependentvariantid . ' on PID ' . $pid, E_ERROR, $sys_dependentvariantid);
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
        $values['style'] = 'image_display_article_medium';
        $values['data_align'] = 'right';
        break;

      // 2082    gloDsArticleImgCenter    D - Article Image Center.
      case '2082':
        $values['style'] = 'image_display_article_medium';
        $values['data_align'] = 'center';
        break;

      // 2084    gloDsArticleImgCtrFull    D - Article Image Center Full.
      case '2084':

        $values['style'] = 'image_display_article_full';
        $values['data_align'] = 'center';
        break;

      // 2086    gloDsArticleImgLeftMed    D - Article Image Left Medium.
      case '2086':

        $values['style'] = 'image_display_article_medium';
        $values['data_align'] = 'left';
        break;

      // 2088    gloDsArticleImgLeftSm    D - Article Image Left Small.
      case '2088':

        $values['style'] = 'image_display_article_small';
        $values['data_align'] = 'left';
        break;

      // 2090    gloDsArticleImgRtSm    D - Article Image Right Small.
      case '2090':

        $values['style'] = 'image_display_article_small';
        $values['data_align'] = 'right';
        break;

      // INFOGRAPHICS
      // gloDsHighlightRtSm.
      case '2250':

        $values['style'] = 'infographic_display_article_medium';
        $values['data_align'] = 'right';
        break;

      // gloDsHighlightCenter.
      case '2238':

        $values['style'] = 'infographic_display_article_large';
        $values['data_align'] = 'center';
        break;

      // gloDsHighlightRtMed.
      case '2246':

        $values['style'] = 'infographic_display_article_medium';
        $values['data_align'] = 'right';
        break;

      // VIDEOS
      // loSnVideo50NoTitleLeft.
      case '1835':

        $values['style'] = 'video_display_small_no_title';
        $values['data_align'] = 'left';
        break;

      // gloSnVideo100Title.
      case '1825':

        $values['style'] = 'video_display_large_title';
        $values['data_align'] = 'center';
        break;

      // gloSnVideoCarouselInline.
      case '2371':

        $values['style'] = 'full';
        $values['data_align'] = 'center';
        break;

      // gloSnVideo50TitleRight.
      case '1833':

        $values['style'] = 'video_display_small_no_title';
        $values['data_align'] = 'right';
        break;

      // gloSnVideo100NoTitle.
      case '1823':

        $values['style'] = 'video_display_large_no_title';
        $values['data_align'] = 'center';
        break;

      // gloSnVideo75NoTitle.
      case '1831':

        $values['style'] = 'video_display_medium_no_title';
        $values['data_align'] = 'center';
        break;

      // gloSnVideo75Title.
      case '1841':

        $values['style'] = 'video_display_medium_title';
        $values['data_align'] = 'center';
        break;

      // gloSnVideo50NoTitleRight.
      case '1839':

        $values['style'] = 'video_display_small_no_title';
        $values['data_align'] = 'right';
        break;

      // FEATURE CARD.
      case '2388':
        $values['style'] = 'embedded_feature_card';
        $values['data_align'] = 'right';
        break;

      // Image Carousel.
      case '2539':
        $values['style'] = 'embedded_feature_card';
        $values['data_align'] = 'center';
        break;

      // gloDsSnBody    S – Body.
      case '1998    ':
        $values['style'] = 'embedded_feature_card';
        $values['data_align'] = '';
        break;

    }

    return $values;
  }

  /**
   * Create a media embed item to insert into text.
   *
   * @return string
   *   Returns the media embed item for this media.
   */
  public function createMediaEmbedText($media_entity_id, $values) {

    $media_storage = \Drupal::entityTypeManager()->getStorage('media');
    $media_entity = $media_storage->load($media_entity_id);

    $element = $this->doc->createElement('drupal-entity');
    if (!empty($media_entity)) {
      $style = !empty($values['style']) ? $values['style'] : NULL;
      $data_align = !empty($values['data_align']) ? $values['data_align'] : NULL;
      $data_caption = !empty($values['data_caption']) ? $values['data_caption'] : NULL;
      $attributes = [
        'data-embed-button' => 'media_entity_embed',
        'data-entity-embed-display' => 'view_mode:media.' . $style,
        'data-entity-type' => 'media',
        'data-entity-uuid' => $media_entity->get('uuid')->value,
      ];
      if (!empty($data_align)) {
        $attributes['data-align'] = $data_align;
      }
      $attributes['data-caption'] = $data_caption;
      foreach ($attributes as $key => $value) {
        $element->setAttribute($key, $value);

      }
    }
    return $element;
  }

}
