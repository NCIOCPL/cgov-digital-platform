<?php

namespace Drupal\cgov_schema_org\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Plugin implementation of the 'cgov_schema_org' field type.
 *
 * @FieldType(
 *   id = "schema_org_data",
 *   label = @Translation("Schema.org Data"),
 *   description = @Translation("Data related to schema.org markup."),
 *   default_widget = "cgov_schema_org_widget",
 *   default_formatter = "cgov_schema_org_empty_formatter",
 *   serialized_property_names = {
 *     "page_itemtype"
 *   }
 * )
 */
class CgovSchemaOrgFieldItem extends FieldItemBase {

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    return [
      'columns' => [
        'page_itemtype' => [
          'description' => 'Schema.org markup itemtype of the page.',
          'type' => 'text',
        ],
      ],
    ];
  }

  /**
   * {@inheritdoc}
   */
  public static function mainPropertyName() {
    return 'page_itemtype';
  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    return [
      'page_itemtype' => DataDefinition::create('string')->setLabel(t('Page Schema.org Type')),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {
    $page_itemtype = $this->get('page_itemtype');
    return empty($page_itemtype);
  }

}
