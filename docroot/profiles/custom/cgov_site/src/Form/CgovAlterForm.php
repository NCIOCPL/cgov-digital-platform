<?php

namespace Drupal\cgov_site\Form;

use Drupal\Core\Form\FormStateInterface;
use Drupal\features_ui\Form\AssignmentFormBase;

/**
 * Configures the selected configuration assignment method for this site.
 */
class CgovAlterForm extends AssignmentFormBase {

  const METHOD_ID = 'cgov_alter';

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'cgov_alter_form';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, $bundle_name = NULL) {
    $this->currentBundle = $this->assigner->loadBundle($bundle_name);

    $settings = $this->currentBundle->getAssignmentSettings(self::METHOD_ID);
    $workflow_settings = $settings['workflow'];

    $form['workflow'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('Strip out <em>_dependencies and type_settings</em> property from workflow config.'),
      '#default_value' => $workflow_settings,
      '#description' => $this->t('Select this option to remove the <em>_dependencies and type_settings</em> configuration property on export.'),
    ];

    $this->setActions($form, self::METHOD_ID);

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    // Merge in selections.
    $settings = $this->currentBundle->getAssignmentSettings(self::METHOD_ID);
    $settings = array_merge($settings, [
      'workflow' => $form_state->getValue('workflow'),
    ]);

    $this->currentBundle->setAssignmentSettings(self::METHOD_ID, $settings)->save();

    $this->setRedirect($form_state);
    drupal_set_message($this->t('Package assignment configuration saved.'));
  }

}
