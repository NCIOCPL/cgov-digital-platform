<?php
use Drupal\system\Form\ThemeSettingsForm;

/**
 * Implements hook_form_system_theme_settings_alter().
 *
 * Custom theme settings.
 */
function ncids_trans_form_system_theme_settings_alter(&$form) {
  // close default detail boxes
  $form['theme_settings']['#open'] = FALSE;
  $form['logo']['#open'] = FALSE;
  $form['favicon']['#open'] = FALSE;

  // Modify the allowed types of logos. We only want to allow SVGs.
  // So while the Drupal community argues if SVGs *can* be used, we will
  // *only* allow them. (SVGs scale better and use less bandwith)
  $form['logo']['settings']['logo_upload']['#upload_validators'] = [
    'file_validate_extensions' => ['svg'],
  ];

  /* ------------ 'Has Translations' button ----------- */
  /* --- This was copied from the cgov_common theme --- */
  /* --- It is used in random places, so let's keep --- */
  /* --- it for now so we don't break anything.     --- */
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
