<?php

namespace Drupal\cgov_mail\Form;

/**
 * @file
 * Contains Drupal\cgov_mail\Form\SettingsForm.
 */

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class SettingsForm.
 *
 * @package Drupal\cgov_mail\Form
 */
class MailSettingsForm extends ConfigFormBase {
  /**
   * Config settings.
   *
   * @var string
   */
  const CGOV_MAIL_SETTINGS = 'cgov_mail.settings';

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      static::CGOV_MAIL_SETTINGS,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'cgov_settings_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config(static::CGOV_MAIL_SETTINGS);
    $form['contact_form_recipient'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Contact Form Recipient'),
      '#default_value' => $config->get('contact_form_recipient'),
    ];
    $form['es_contact_form_recipient'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Spanish Contact Form Recipient'),
      '#default_value' => $config->get('es_contact_form_recipient'),
    ];
    $form['re-captcha'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Re-captcha Key'),
      '#default_value' => $config->get('re-captcha'),
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);

    $this->config(static::CGOV_MAIL_SETTINGS)
      ->set('contact_form_recipient', $form_state->getValue('contact_form_recipient'))
      ->set('re-captcha', $form_state->getValue('re-captcha'))
      ->save();
  }

}
