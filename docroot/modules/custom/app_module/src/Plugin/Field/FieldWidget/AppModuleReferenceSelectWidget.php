<?php

namespace Drupal\app_module\Plugin\Field\FieldWidget;

use Drupal\app_module\AppModules;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\Plugin\Field\FieldWidget\OptionsSelectWidget;
use Drupal\Core\Form\FormStateInterface;

/**
 * Plugin implementation of the 'options_select' widget.
 *
 * @FieldWidget(
 *   id = "app_module_reference_select",
 *   label = @Translation("App module reference select list"),
 *   description = @Translation("An autocomplete app module select list field."),
 *   field_types = {
 *     "app_module_reference"
 *   }
 * )
 */
class AppModuleReferenceSelectWidget extends OptionsSelectWidget {

  /**
   * {@inheritdoc}
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {

    // Set the target_id field to the select (#type => select) FromElement
    // from our parent.
    $form_fields['target_id'] = parent::formElement($items, $delta, $element, $form, $form_state);

    // Set some options on the target_id field.
    $form_fields['target_id']['#multiple'] = FALSE;
    if (!$this->isDefaultValueWidget($form_state)) {
      $available_apps = $this->getAppModuleNames();
      if (count($available_apps) >= 1) {
        $first_option = ['_none' => '- None -'];
        $form_fields['target_id']['#options'] = array_merge($first_option, $available_apps);
      }
    }

    // Now setup the data form field.
    $data_value = isset($items[$delta]->data) ? $items[$delta]->data : [];
    $data_value = json_encode($data_value, JSON_PRETTY_PRINT | JSON_FORCE_OBJECT);

    $form_fields['data'] = [
      '#type' => 'textarea',
      '#default_value' => $data_value,
      '#rows' => 10,
      '#title' => $this->t('App Module Instance Settings'),
      '#resizable' => 'both',
      '#element_validate' => [
        [$this, 'validateData'],
      ],
    ];

    return $form_fields;
  }

  /**
   * Validates that the data element is proper JSON.
   *
   * @param array $element
   *   The element being validated.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The form state.
   */
  public function validateData(array $element, FormStateInterface $form_state) {
    $data = $element['#value'];

    // Decode using data as an associative array.
    $test = json_decode($data, TRUE);

    // TODO: When we move to PHP 7.3 we should use JSON_THROW_ON_ERROR
    // in the json_decode statement so that we do not have to check
    // errors like this.
    $hasError = json_last_error() !== JSON_ERROR_NONE;

    // Test if the $test is an associative array.
    $is_object = (!$hasError) &&
                  is_array($test) &&
                  (
                    count($test) == 0 ||
                    array_diff_key(
                      $test,
                      array_keys(array_keys($test))
                    )
                  );

    if (!$is_object) {
      $hasError = TRUE;
    }

    if ($hasError) {
      $form_state->setError($element, $this->t('Instance settings must be a valid JSON object.'));
    }
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
    $values = parent::massageFormValues($values, $form, $form_state);

    foreach ($values as $delta => $value) {
      if (isset($value['data'])) {
        $data = json_decode(
          $value['data'],
          TRUE
        );

        $values[$delta]['data'] = $data;
      }
    }

    return $values;
  }

  /**
   * Get app module names for a list of app machine names.
   *
   * @return array
   *   An array with app module labels keyed by machine name.
   */
  protected function getAppModuleNames() {
    $app_modules = AppModules::getEnabledAppModules();
    $options = [];
    foreach ($app_modules as $app_module) {
      $options[$app_module->id()] = $app_module->label();
    }
    return $options;
  }

}
