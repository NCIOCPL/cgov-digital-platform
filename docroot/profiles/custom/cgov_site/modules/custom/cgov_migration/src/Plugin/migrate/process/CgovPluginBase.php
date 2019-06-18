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
  public function getEmbedMapping($sys_dependentvariantid) {
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

      default:

        if (array_key_exists($sys_dependentvariantid, $this->skippedVariants)) {
          throw new \RuntimeException("Manual Task - Variant ID: {$sys_dependentvariantid}
             - {$this->skippedVariants[$sys_dependentvariantid]}");
        }
        else {
          throw new \RuntimeException("Variant: {$sys_dependentvariantid} has no mapping. ");
        }

    }
    return $values;
  }

  /**
   * Returns an entity of an unknown type.
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

  /**
   * Attains the inner HTML of a DOMElement.
   */
  protected function innerHtml(\DOMElement $element) {
    $doc = $element->ownerDocument;

    $html = '';

    foreach ($element->childNodes as $node) {
      $html .= $doc->saveHTML($node);
    }

    return $html;
  }

  /**
   * Create an embed item to insert into text.
   *
   * @return Object
   *   Returns the embed item for this entity.
   */
  protected function createEmbedText($entity_id, $values) {
    $entity_storage = \Drupal::entityTypeManager()->getStorage($values['data_entity_type']);
    $entity = $entity_storage->load($entity_id);

    $element = $this->doc->createElement('drupal-entity');

    if (empty($entity)) {
      // Check to see if this is this is a translated ID or microsite ID.
      // Setup the mapping lists.
      $translationList = $this->getContentIdArray('translationid.json', 'ID');
      // Check to see if the value is in the translation list as ID
      // IF so, attempt to load the translation ID.
      if (array_key_exists($entity_id, $translationList)) {
        // The entity id doesn't live on this Drupal instance but is in the
        // reference list of items.
        // Check to see if it's been imported as a translation.
        $translationid = $translationList[$entity_id]['translationid'];

        // Empty arrays have non-strict comparison, check is_null also.
        if ($translationid != 'NULL' && !empty($translationid) && !is_null($translationid)) {
          // It has an english translation; verify it's in the system.
          $entity = $this->getEntityOfUnknownType($translationid);

          if (empty($entity)) {
            throw new \RuntimeException("The translated entity with new id {$translationid} was not loaded 
      into Drupal, but was found in the  mapping.");
          }
        }
      }

      if (empty($entity)) {
        throw new \RuntimeException("The entity with id {$entity_id} was not loaded 
      into Drupal and cold not be found in a mapping.");
      }
    }

    // Generate the attributes, UUID for the embed.
    $attributes = $this->generateEmbedAttributes($entity, $values);

    foreach ($attributes as $key => $value) {
      $element->setAttribute($key, $value);
    }

    return $element;
  }

  /**
   * Generate embed attributes given an entity on indiscriminate type.
   */
  private function generateEmbedAttributes($entity, $values) {

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

    return $attributes;
  }

  /**
   * Helper function. Format migration mapping data.
   */
  protected function getContentIdArray($filename, $key) {
    // The entity doesn't live on this Drupal instance.
    // Check to see if it's a cross site link. If so, create a static link.
    // Parse the json.
    $module_handler = \Drupal::service('module_handler');
    $module_path = $module_handler->getModule('cgov_migration')->getPath();

    $json = file_get_contents($module_path . '/migrations/' . $filename);

    // Format the data to a more manageable array.
    $link_array = json_decode($json, TRUE);
    $id_array = $this->groupAndFlattenArray($link_array, $key);

    return $id_array;

  }

  /**
   * Helper function. Group array data, then flatten, by key.
   */
  protected function groupAndFlattenArray($arr, $group, $preserveGroupKey = FALSE, $preserveSubArrays = FALSE) {
    $temp = [];

    if (!empty($arr)) {
      foreach ($arr as $key => $value) {
        $groupValue = $value[$group];
        if (!$preserveGroupKey) {
          unset($arr[$key][$group]);
        }
        if (!array_key_exists($groupValue, $temp)) {
          $temp[$groupValue] = [];
        }

        if (!$preserveSubArrays) {
          $data = count($arr[$key]) == 1 ? array_pop($arr[$key]) : $arr[$key];
        }
        else {
          $data = $arr[$key];
        }
        $temp[$groupValue][] = $data;
      }

      // Flatten the grouped array.
      foreach ($temp as &$tempKey) {
        $tempKey = $tempKey[0];
      }
    }

    return $temp;
  }

  /**
   * Replace Percussion embeds with Drupal embeds.
   */
  protected function processEmbeds($pid, $allNodes, $type) {
    // Note: Don't use a foreach; it doesn't work. Must loop backwards.
    for ($i = $allNodes->length - 1; $i >= 0; $i--) {
      $divNode = $allNodes->item($i);
      $sys_dependentvariantid = $divNode->getAttr('sys_dependentvariantid');
      $sys_dependentid = $divNode->getAttr('sys_dependentid');

      if (!empty($sys_dependentvariantid)) {
        // Populate the attributes for the Drupal embed.
        try {
          $embedAttributes = $this->getEmbedMapping($sys_dependentvariantid);
          $replacementEmbed = $this->createEmbedText($sys_dependentid, $embedAttributes);

          $this->migLog->logMessage($pid, 'Replacing ' . $type . 'for perc ID: ' .
          $sys_dependentid, E_NOTICE, $sys_dependentvariantid);
        }
        catch (\Exception $e) {
          // Put an error placeholder.
          $replacementEmbed = $this->doc->createElement('drupal-entity',
          'ERROR REPLACING EMBED: ' . $sys_dependentid . ' With variant: ' .
          $sys_dependentvariantid);

          $this->migLog->logMessage($pid, $type . 'Error replacing Embed ' . $sys_dependentid .
            ' on PID ' . $pid . ': ' . $e->getMessage(), E_ERROR, $sys_dependentid);

        }
        // Replace the HTML Node.
        $divNode->parentNode->replaceChild($replacementEmbed, $divNode);
      }
    }
  }

}
