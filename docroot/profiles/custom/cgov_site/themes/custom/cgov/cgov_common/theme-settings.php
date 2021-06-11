<?php
use Drupal\system\Form\ThemeSettingsForm;


/**
 * Implements hook_form_system_theme_settings_alter().
 *
 * Custom theme settings
 */
function cgov_common_form_system_theme_settings_alter(&$form) {
  global $base_url;

  if (isset($form_id)) {
    return;
  }

  // close default detail boxes
  $form['theme_settings']['#open'] = FALSE;
  $form['logo']['#open'] = FALSE;
  $form['favicon']['#open'] = FALSE;

  /* --------------- Color Variant settings -------------- */
  $form['variant'] = array(
    '#type' => 'details',
    '#title' => t('Color Variant'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#open' => TRUE,
  );
  $form['variant']['color_theme'] = array(
    '#type' => 'select',
    '#title' => t('Theme'),
    '#default_value' => theme_get_setting('color_theme'),
    '#description' => t('Select a color variant for this theme'),
    '#options' => [
      'none' => t('-None-'),
      'purple' => t('Purple'),
      'blue' => t('Blue'),
      'green' => t('Green'),
        'connect' => t('Connect'),
      // Add new theme names here. Value(key) should match folder name in /src/variants
    ],
  );
  /* ------------ 'Has Translations' button ----------- */
  $form['translations'] = array(
    '#type' => 'details',
    '#title' => ('Translations'),
    '#collapsible' => TRUE,
    '#collapsed' => FALSE,
    '#open' => TRUE,
  );
  $form['translations']['has_translations'] = array(
    '#type' => 'checkbox',
    '#title' => t('Has Translations'),
    '#description' => t('Does the site include translated content?'),
    '#default_value' => theme_get_setting('has_translations'),
  );
}
