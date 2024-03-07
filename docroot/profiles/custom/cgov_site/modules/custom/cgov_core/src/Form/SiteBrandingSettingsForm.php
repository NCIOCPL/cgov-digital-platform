<?php

namespace Drupal\cgov_core\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Configure site branding settings.
 */
class SiteBrandingSettingsForm extends ConfigFormBase {

  /**
   * Config settings.
   *
   * @var string
   */
  const SETTINGS = 'sitebranding.settings';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'site_branding_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      static::SETTINGS,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(static::SETTINGS);
    $form['tags'] = [
      '#type' => 'details',
      '#title' => "Site Branding",
      '#open' => TRUE,
    ];

    $form['tags']['browser_display_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Browser Title Site Name Display Option'),
      '#description' => $this->t('Branding title appended to the end of the browser title for all pages on the site. Default is "- NCI". Select "No Title" for sites that do not want to have NCI appended to their browser titles.'),
      '#options' => $this->getOptions(),
      '#required' => TRUE,
      '#default_value' => $config->get('browser_display_type'),
    ];
    $form['tags']['custom_site_title_value'] = [
      '#type' => 'textfield',
      '#description' => $this->t('Custom title text to be appended to the browser title. Do not include dash (-).'),
      '#maxlength' => 50,
      '#title' => $this->t('Custom Site Title'),
      '#default_value' => $config->get('custom_site_title_value'),
      '#states' => [
        'disabled' => [
          ':input[name="browser_display_type"]' => ['!value' => 'custom_title'],
        ],
      ],
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Retrieve the configuration.
    $this->config(static::SETTINGS)
      ->set('browser_display_type', $form_state->getValue('browser_display_type'))
      ->set('custom_site_title_value', $form_state->getValue('custom_site_title_value'))
      ->save();
    parent::submitForm($form, $form_state);
    drupal_flush_all_caches();
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    if ($form_state->getValue('browser_display_type') === 'custom_title' && $form_state->isValueEmpty('custom_site_title_value')) {
      $form_state->setErrorByName('custom_site_title_value', $this->t("Please enter the Custom Site Title text to save this page."));
    }
  }

  /**
   * Get language options.
   */
  public function getOptions() {
    $options = [
      'default' => $this->t('NCI'),
      'no_title' => $this->t('No Title'),
      'custom_title' => $this->t('Custom Title'),
    ];
    return $options;
  }

}
