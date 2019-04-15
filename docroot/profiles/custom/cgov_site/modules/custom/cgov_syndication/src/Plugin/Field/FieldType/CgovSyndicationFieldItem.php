<?php

namespace Drupal\cgov_syndication\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'cgov_syndication' field type.
 *
 * @FieldType(
 *   id = "hhs_syndication",
 *   label = @Translation("HHS Syndication"),
 *   description = @Translation("Whether and when to syndicate items."),
 *   default_widget = "cgov_syndication_widget",
 *   default_formatter = "cgov_syndication_empty_formatter",
 *   serialized_property_names = {
 *     "syndicate",
 *     "keywords"
 *   }
 * )
 */
class CgovSyndicationFieldItem extends FieldItemBase {

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    return [
      'columns' => [
        'syndicate' => [
          'description' => 'Whether this entity should be exported',
          'type' => 'int',
          'size' => 'tiny',
          'default' => 0,
        ],
        'keywords' => [
          'description' => 'Topics which should trigger export of entity',
          'type' => 'text',
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public static function mainPropertyName() {
    return 'syndicate';
  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    return [
      'syndicate' => DataDefinition::create('integer')->setLabel(t('Syndicate')),
      'keywords' => DataDefinition::create('string')->setLabel(t('Keywords')),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {
    $syndicate = $this->get('syndicate');
    $keywords = $this->get('keywords');
    return empty($syndicate) && empty($keywords);
  }

}
