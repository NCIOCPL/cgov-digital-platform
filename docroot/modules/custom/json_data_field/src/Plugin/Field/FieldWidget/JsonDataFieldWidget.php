<?php

namespace Drupal\json_data_field\Plugin\Field\FieldWidget;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\StringTextareaWidget;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml as SymfonyYaml;
use Symfony\Component\Yaml\Parser;
use Symfony\Component\Yaml\Exception\ParseException;

/**
 * Plugin implementation of the 'yaml_textarea' widget.
 *
 * @FieldWidget(
 *   id = "yaml_textarea",
 *   label = @Translation("Plain Text area (multiple rows)"),
 *   field_types = {
 *     "json_data"
 *   }
 * )
 */
class JsonDataFieldWidget extends StringTextareaWidget {

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $element = parent::settingsForm($form, $form_state);
    $element['rows']['#description'] = $this->t('Text editors (like CKEditor) may override this setting.');
    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    $data_value = $items[$delta]->value ?? [];

    if (!empty($data_value)) {

      // Convert the PHP array into YAML data.
      $dumper = new Dumper(2);
      $yaml = $dumper->dump($data_value, PHP_INT_MAX, 0, SymfonyYaml::DUMP_EXCEPTION_ON_INVALID_TYPE | SymfonyYaml::DUMP_MULTI_LINE_LITERAL_BLOCK);

      // Remove return after array delimiter.
      $yaml = preg_replace('#((?:\n|^)[ ]*-)\n[ ]+(\w|[\'"])#', '\1 \2', $yaml);

      $yaml_data = trim($yaml);
    }
    $element['value'] = [
      '#type' => 'textarea',
      '#default_value' => $yaml_data ?? '',
      '#rows' => 10,
      '#title' => $this->t('Yaml Content'),
      '#resizable' => 'both',
    ];

    $element['#element_validate'][] = [$this, 'validateElement'];

    return $element;
  }

  /**
   * Validates that the data element is proper JSON.
   *
   * @param array $element
   *   The element being validated.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public function validateElement(array $element, FormStateInterface $form_state) {
    // Decode the YAML data into array.
    $is_valid_yaml = self::isValid($element['value']['#value']);
    if (!$is_valid_yaml) {
      $form_state->setError($element, $this->t('Yaml Content must be valid YAML Data.'));
    }
  }

  /**
   * Determine if string is valid YAML.
   *
   * @param string $yaml
   *   A YAML string.
   *
   * @return bool
   *   TRUE if string is valid YAML.
   */
  public static function isValid($yaml) {
    return self::validate($yaml) ? FALSE : TRUE;
  }

  /**
   * Validate YAML string.
   *
   * @param string $yaml
   *   A YAML string.
   *
   * @return null|string
   *   NULL if the YAML string contains no errors, else the parsing exception
   *   message is returned.
   */
  public static function validate($yaml) {

    if (empty($yaml)) {
      return NULL;
    }
    try {
      SymfonyYaml::parse($yaml);
      return NULL;
    }
    catch (ParseException $exception) {
      return $exception->getMessage();
    }
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
    $values = parent::massageFormValues($values, $form, $form_state);

    foreach ($values as $delta => $value) {
      if (isset($value['value'])) {
        if (empty($value['value'])) {
          unset($values[$delta]['value']);
        }

        // The parse() method parses a YAML string
        // and converts it to a PHP array:
        try {
          $yaml = new Parser();
          $yaml_data = $yaml->parse($value['value']);
          $values[$delta]['value'] = $yaml_data;
        }
        catch (\Exception $exception) {
          return $exception->getMessage();
        }
      }
    }

    return $values;
  }

}
