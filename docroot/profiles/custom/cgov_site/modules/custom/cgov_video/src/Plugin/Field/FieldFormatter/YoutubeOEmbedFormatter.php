<?php

namespace Drupal\cgov_video\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Cgov implementation of youtube OEmbed Formatter.
 *
 * @FieldFormatter(
 *   id = "cgov_youtube_oembed",
 *   label = @Translation("Cgov Youtube oEmbed video"),
 *   field_types = {
 *     "string",
 *   },
 * )
 */
class YoutubeOEmbedFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    if (!empty($items)) {
      // @var \Drupal\Core\Field\Plugin\Field\FieldType\StringItem
      $urlStringItem = $items[0];
      $urlString = $urlStringItem->value;
      $parsedUrl = parse_url($urlString);
      $query = isset($parsedUrl['query']) ? $parsedUrl['query'] : '';
      parse_str($query, $parsedQuery);
      $videoId = isset($parsedQuery['v']) ? $parsedQuery['v'] : '';
      if ($videoId) {
        $entity = $urlStringItem->getEntity();
        // The text used for the video title is the 'name' field on
        // the media entity that also contains this field. So we
        // need to reach up and around to retrieve that.
        $videoTitle = $entity->get('name')->value;
        // This is the same render array element type used by
        // the StringFormatter class.
        // Instead of using a template, we can use this render
        // element as a barebones delivery device of raw strings
        // in the data array.
        $renderArray = [
          '#type' => 'inline_template',
          "#data" => [
            'id' => $videoId,
            'title' => $videoTitle,
          ],
          // Create a cache tag entry for the referenced entity. In the case
          // that the referenced entity is deleted, the cache for referring
          // entities must be cleared.
          '#cache' => [
            'tags' => $entity->getCacheTags(),
          ],
        ];
        $elements['videoId'] = $renderArray;
      }
    }

    return $elements;
  }

}
