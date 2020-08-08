<?php

namespace Drupal\cgov_site_section\Form;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Form\ConfirmFormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Url;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * Form for invalidating the MainNav block in the cache.
 */
class InvalidateMainNavCacheForm extends ConfirmFormBase {

  use StringTranslationTrait;

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'main_nav_cache_form';
  }

  /**
   * {@inheritdoc}
   */
  public function getQuestion() {
    return $this->t('Do you want to clear the main nav from cache?');
  }

  /**
   * {@inheritdoc}
   */
  public function getCancelUrl() {
    return new Url('system.admin_config_search');
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['description'] = [
      '#markup' => '<p>' .
      $this->t('This page allows you to clear the Main Nav from the cache. THIS WILL REMOVE ALL PAGES FROM AKAMAI CACHE! So it is recommended that you only do this off hours, or know what the implications of clearing this will be.') .
      '</p>',
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    Cache::invalidateTags(['mainnav_manual']);
    $this->messenger()->addStatus($this->t('MainNav cleared from the cache.'));
  }

}
