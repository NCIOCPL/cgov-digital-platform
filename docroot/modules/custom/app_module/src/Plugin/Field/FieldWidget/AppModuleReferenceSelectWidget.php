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
    $select_element['target_id'] = parent::formElement($items, $delta, $element, $form, $form_state);

    // This sets up the form element.
    $select_element = $this->fieldElement($items, $delta, $select_element, $form, $form_state);
    $select_element['target_id']['#multiple'] = FALSE;
    if (!$this->isDefaultValueWidget($form_state)) {
      $available_apps = $this->getAppModuleNames();
      if (count($available_apps) >= 1) {
        $first_option = ['_none' => '- None -'];
        $select_element['target_id']['#options'] = array_merge($first_option, $available_apps);
      }
    }
    return $select_element;
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

  /**
   * Build a field element for a app_module_reference field.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface $items
   *   Array of default values for this field.
   * @param int $delta
   *   The order of this item in the array of sub-elements (0, 1, 2, etc.).
   * @param array $element
   *   The field item element.
   * @param array $form
   *   The overall form array.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   Array of default values for this field.
   *
   * @return array
   *   The changed field element.
   */
  public function fieldElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    // On selection of view, an Ajax call must be made to get the settings
    // for this app module. This will then either replace the select element,
    // or replace it.
    return $element;
  }

}
