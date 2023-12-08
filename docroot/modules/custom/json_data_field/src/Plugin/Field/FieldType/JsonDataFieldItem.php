<?php

namespace Drupal\json_data_field\Plugin\Field\FieldType;

use Drupal\Core\Field\FieldItemBase;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\StringTranslation\TranslatableMarkup;
use Drupal\Core\TypedData\DataDefinition;

/**
 * Defines the 'json_data' field type.
 *
 * @FieldType(
 *   id = "json_data",
 *   label = @Translation("JSON (stored as text in database)"),
 *   description = @Translation("Allows JSON data to be stored in the database. In the database the content is stored in a text column."),
 *   category = @Translation("Data"),
 *   default_widget = "yaml_textarea",
 *   default_formatter = "json_data_formatter",
 *   constraints = {"valid_json_schema" = {}, "valid_json_data_length" = {}}
 * )
 */
class JsonDataFieldItem extends FieldItemBase {

  /**
   * Json data medium text 16MB/utf8mb4.
   */
  const SIZE = 4194304;

  /**
   * {@inheritdoc}
   */
  public static function defaultStorageSettings() {
    return [
      'size' => static::SIZE,
      'json_schema_file' => '',
    ] + parent::defaultStorageSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function storageSettingsForm(array &$form, FormStateInterface $form_state, $has_data) {
    $elements = parent::storageSettingsForm($form, $form_state, $has_data);

    // Get json_schema_file settings.
    $schema_file_uri = $this->getSettings()['json_schema_file'] ?? '';
    if (!empty($schema_file_uri) && !is_array($schema_file_uri)) {
      $elements['current_json_schema'] = [
        '#type' => 'fieldset',
        '#title' => $this->t('Current JSON Schema File'),
      ];
      $elements['current_json_schema']['json_schema_file_path'] = [
        '#type' => 'label',
        '#title' => $schema_file_uri,
      ];
    }

    $elements['json_schema_file'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('JSON Schema File'),
      '#description' => $this->t('Please enter a schema file uri OR upload a file'),
      '#element_validate' => [[static::class, 'fieldSettingsFormValidate']],
    ];

    $elements['json_schema_file']['json_schema_file_uri'] = [
      '#type' => 'textfield',
      '#title' => $this->t('JSON Schema File Uri'),
      '#default_value' => '',
      /* @todo some day validate this as JSONSchema */
    ];

    // Set upload file location.
    $upload_location = 'public://json_data_field/';
    $elements['json_schema_file']['file_upload'] = [
      '#type' => 'managed_file',
      '#title' => $this->t('JSON Schema File'),
      '#upload_location' => $upload_location,
      '#upload_validators' => [
        'file_validate_extensions' => ['json'],
      /* @todo some day validate this as JSONSchema */
      ],
    ];

    return $elements;

  }

  /**
   * Form element validation handler; Invokes selection plugin's validation.
   *
   * @param array $form
   *   The form where the settings form is being included in.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state of the (entire) configuration form.
   */
  public static function fieldSettingsFormValidate(array $form, FormStateInterface $form_state) {
    $json_schema_file = $form_state->getValue('settings')['json_schema_file'];
    if (!empty($json_schema_file) && !empty($json_schema_file['json_schema_file_uri']) && !empty($json_schema_file['file_upload'])) {
      $form_state->setError(
        $form,
        \Drupal::translation()->translate('Please enter only a schema file uri OR upload a file. You can not use both')
      );
    }

    // Check if JSONSchema file exists in the system.
    if (!empty($json_schema_file) && !empty($json_schema_file['json_schema_file_uri'])) {
      if (!file_exists($json_schema_file['json_schema_file_uri'])) {
        $form_state->setError(
          $form,
          \Drupal::translation()->translate('JSONSchema file does not exist in the system.')
        );
      }
    }

  }

  /**
   * {@inheritdoc}
   */
  public static function propertyDefinitions(FieldStorageDefinitionInterface $field_definition) {
    return [
      'value' => DataDefinition::create('any')->setLabel(new TranslatableMarkup('JSON Data Field')),
    ];
  }

  /**
   * {@inheritdoc}
   */
  public static function schema(FieldStorageDefinitionInterface $field_definition) {
    $schema['columns']['value'] = [
      'description' => 'Serialized data.',
      'type' => 'text',
      'size' => 'medium',
      'serialize' => TRUE,
    ];
    return $schema;
  }

  /**
   * {@inheritdoc}
   */
  public static function getPreconfiguredOptions() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public static function mainPropertyName() {
    return 'value';
  }

  /**
   * {@inheritdoc}
   */
  public static function storageSettingsToConfigData(array $settings) {
    // Save the FilUri in config settings
    // when entering the JsonSchema Uri through UI.
    if (isset($settings['json_schema_file']) && is_array($settings['json_schema_file'])) {
      if (!empty($settings['json_schema_file']['file_upload'])) {
        $schema_fid = $settings['json_schema_file']['file_upload'][0];
        if (!empty($schema_fid) && $file = \Drupal::entityTypeManager()->getStorage('file')->load($schema_fid)) {
          /** @var \Drupal\file\FileInterface $file */
          $file->setPermanent();
          $file->save();
          $settings['json_schema_file'] = $file->getFileUri();
        }
      }

      if (!empty($settings['json_schema_file']['json_schema_file_uri'])) {
        $settings['json_schema_file'] = $settings['json_schema_file']['json_schema_file_uri'];
      }

    }

    // Save the FilUri in config settings
    // when importing via config.
    if (!empty($settings['json_schema_file']) && !is_array($settings['json_schema_file'])) {
      return $settings;
    }

    // Assign empty if the JsonSchema Uri has no value.
    if (empty($settings['json_schema_file']['json_schema_file_uri']) && empty($settings['json_schema_file']['file_upload'])) {
      $settings['json_schema_file'] = '';
    }

    return $settings;
  }

  /**
   * {@inheritdoc}
   */
  public function isEmpty() {
    $value = $this->get('value')->getValue();
    return $value === NULL || $value === '';
  }

}
