<?php

namespace Drupal\cgov_core\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class SiteConfigForm.
 *
 * @package Drupal\cgov_core\Form
 */
class SiteConfigForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['cgov_core.site_config'];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'site_configuration_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('cgov_core.site_config');
    $form['site'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Site ID'),
      '#description' => $this->t('Unique string identifying specific micro-site (e.g., cgov).'),
      '#default_value' => $config->get('site'),
    ];
    $form['prod_base'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Prod URL'),
      '#description' => $this->t('The base URL for this site on the production tier (e.g., https://www.cancer.gov).'),
      '#default_value' => $config->get('prod_base'),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('cgov_core.site_config')
      ->set('site', $form_state->getValue('site'))
      ->set('prod_base', $form_state->getValue('prod_base'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
