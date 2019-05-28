<?php

namespace Drupal\cgov_core\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Config\ConfigFactoryInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Class FrontendGlobalsForm.
 */
class FrontendGlobalsForm extends FormBase {

  /**
   * Config factory.
   *
   * @var Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * {@inheritdoc}
   */
  public function __construct(ConfigFactoryInterface $configFactory) {
    $this->configFactory = $configFactory;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'frontend_globals_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->configFactory->get('cgov_core.frontend_globals');
    $currentSettings = $config->get('config_object');
    $currentSettings = $currentSettings ? $currentSettings : '{}';
    $form['field_frontend_globals_config'] = [
      '#type' => 'textarea',
      '#title' => $this->t('Frontend Globals JSON Config Object'),
      '#description' => $this->t('Add a JSON object with values you want exposed on the global scope in the browser'),
      '#default_value' => $currentSettings,
      '#weight' => '0',
    ];
    $form['submit'] = [
      '#type' => 'submit',
      '#value' => $this->t('Save'),
    ];

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Display result.
    foreach ($form_state->getValues() as $key => $value) {
      if ($key === 'field_frontend_globals_config') {
        $config = $this->configFactory->getEditable('cgov_core.frontend_globals');
        $config->set('config_object', $value)->save();
      }
    }
  }

}
