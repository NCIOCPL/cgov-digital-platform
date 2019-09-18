<?php

namespace Drupal\app_module\Plugin\Field\FieldType;

use Drupal\app_module\AppModule;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\Field\Plugin\Field\FieldType\EntityReferenceItem;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Defines the 'appmodulereference' entity field type.
 *
 * The target type for appmodulereference fields should always be 'app_module'.
 *
 * @FieldType(
 *   id = "app_module_reference",
 *   label = @Translation("Application module reference"),
 *   description = @Translation("A field reference to an application module."),
 *   category = @Translation("Reference"),
 *   default_widget = "app_module_reference_select",
 *   default_formatter = "app_module_reference_formatter",
 *   list_class = "\Drupal\Core\Field\EntityReferenceFieldItemList",
 *   cardinality = 1,
 * )
 */
class AppModuleReferenceItem extends EntityReferenceItem {

  /**
   * {@inheritdoc}
   */
  public static function defaultStorageSettings() {
    return [
      'target_type' => 'app_module',
    ] + parent::defaultStorageSettings();
  }

  /* ABOUT FIELD SETTINGS:
   * All app modules should be up for grabs, we always allow instance
   * settings. So, we have no field settings right now. Actually we only
   * have one field for now for app modules. We could however have other
   * instances like in a paragraph, or etc. Like some sort of widget. In
   * this case we might not want all the page loading support that a full
   * page widget would need. That could be an example setting.
   *
   * So we do not need to implement fieldSettingsForm() nor
   * defaultFieldSettings().
   */

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    $properties = parent::propertyDefinitions($field_definition);
    $properties['data'] = DataDefinition::create('string')
      ->setLabel(new TranslatableMarkup('Data'))
      ->setDescription(new TranslatableMarkup('Settings data for this instance'));
    return $properties;
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    $schema = parent::schema($field_definition);
    $schema['columns']['data'] = [
      'description' => 'Serialized data.',
      'type' => 'text',
      'size' => 'big',
    ];
    return $schema;
  }

  /**
   * {@inheritdoc}
   */
  public function setValue($values, $notify = TRUE) {
    // Select widget has extra layer of items.
    if (isset($values['target_id']) && is_array($values['target_id'])) {
      $values['target_id'] = isset($values['target_id'][0]['target_id']) ? $values['target_id'][0]['target_id'] : NULL;
    }
    parent::setValue($values, FALSE);
  }

  /**
   * {@inheritdoc}
   */
  public static function getPreconfiguredOptions() {
    return [];
  }

  /**
   * Get all enabled app module names.
   *
   * @return array
   *   An array of enabled app modules names keyed by app module ID.
   */
  protected function getAllAppModuleNames() {
    $appmodules = AppModule::getEnabledAppModules();
    $options = [];
    foreach ($appmodules as $appmodule) {
      $options[$appmodule->id()] = $appmodule->label();
    }
    return $options;
  }

}
