<?php

namespace Drupal\cgov_adobe\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class for the Cgov Adobe settings.
 */
class CgovAdobeSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'cgov_adobe_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['cgov_adobe.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('cgov_adobe.settings');

    $form['settings'] = [
      '#type'       => 'vertical_tabs',
      '#attributes' => ['class' => ['cgov-adobe-settings']],
    ];

    // General section.
    $form['general'] = [
      '#type'  => 'details',
      '#title' => $this->t('General'),
      '#group' => 'settings',
    ];

    $form['general']['enabled'] = [
      '#type'          => 'checkbox',
      '#title'         => $this->t('Enable Adobe Launch Tags'),
      '#description'   => $this->t('Will enable the Adobe Tag Management script, using Launch.'),
      '#default_value' => $config->get('enabled'),
    ];

    $form['general']['launch_property_build_url'] = [
      '#type'          => 'textfield',
      '#title'         => $this->t('Build URL'),
      '#description'   => $this->t('Launch property build URL.'),
      '#default_value' => $config->get('launch_property_build_url'),
      '#size'          => 80,
      '#maxlength'     => 250,
      '#states'        => [
        'required' => [
          ':input[name="enabled"]' => ['value' => TRUE],
        ],
      ],
    ];

    $form['general']['exclude_paths'] = [
      '#type'          => 'textarea',
      '#title'         => $this->t('Excluded paths'),
      '#description'   => $this->t("Enter one path per line. ENSURE CASE IS CORRECT!! The '*' character is a wildcard. An example path is %node-edit-wildcard for every node edit page, %admin-wildcard targets administration pages.", [
        '%node-edit-wildcard' => '/node/*/edit',
        '%admin-wildcard'     => '/admin/*',
      ]),
      '#default_value' => $this->implodeListOfItems($config->get('exclude_paths')),
      '#rows'          => 10,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    // Clean text values.
    $launch_property_build_url = trim($form_state->getValue('launch_property_build_url'));
    $form_state->setValue('launch_property_build_url', $launch_property_build_url);
    $exclude_paths = $this->splitAndCleanText($form_state->getValue('exclude_paths'));
    $form_state->setValue('exclude_paths', $exclude_paths);

    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('cgov_adobe.settings')
      ->set('enabled', $form_state->getValue('enabled'))
      ->set('launch_property_build_url', $form_state->getValue('launch_property_build_url'))
      ->set('exclude_paths', $form_state->getValue('exclude_paths'))
      ->save();

    parent::submitForm($form, $form_state);
  }

  /**
   * Splits new lines and cleans a string representing a list of items.
   *
   * @param string $text
   *   The string to clean.
   *
   * @return array
   *   The clean text array.
   */
  protected function splitAndCleanText($text) {
    $text = explode("\n", $text);
    $text = array_map('trim', $text);
    $text = array_filter($text, 'trim');
    return $text;
  }

  /**
   * Implodes a given list of items into a string.
   *
   * @param array $items
   *   The array with list of items.
   *
   * @return string
   *   The imploded list of items as a string.
   */
  protected function implodeListOfItems(array $items) {
    return implode("\n", $items);
  }

}
