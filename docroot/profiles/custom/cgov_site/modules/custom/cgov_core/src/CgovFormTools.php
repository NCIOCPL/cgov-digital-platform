<?php

namespace Drupal\cgov_core;

/**
 * A service which provides methods to alter and configure form elements.
 */
class CgovFormTools {

  /**
   * Sets the allowed formats property for the given form elements.
   *
   * @param array $field_format_map
   *   A map of fields and allowed text formats.
   * @param mixed $element
   *   The field widget form element on which to restrict text formats.
   * @param mixed $context
   *   The Drupal form context.
   */
  public function allowTextFormats(array $field_format_map, &$element, $context) {
    $field_name = $context['items']->getFieldDefinition()->getName();

    if (array_key_exists($field_name, $field_format_map)) {
      $element['#allowed_formats'] = $field_format_map[$field_name];
      $element['#after_build'][] = [static::class, 'removeTextFormatBox'];
    }
  }

  /**
   * Callback for #after_build. Removes dropdown and help text.
   */
  public static function removeTextFormatBox($form_element, $form_state) {
    // Remove help, guidelines and wrapper.
    unset($form_element['format']['help']);
    unset($form_element['format']['guidelines']);
    unset($form_element['format']['#type']);
    unset($form_element['format']['#theme_wrappers']);

    return $form_element;
  }

}
