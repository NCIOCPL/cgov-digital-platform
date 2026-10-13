<?php

namespace Drupal\cgov_saml_auth_config\Form;

use Drupal\Core\Form\FormErrorHandler;
use Drupal\Core\Form\FormErrorHandlerInterface;
use Drupal\Core\Form\FormStateInterface;

/**
 * Displays user login errors inline without changing other forms.
 */
class LoginFormErrorHandler extends FormErrorHandler {

  /**
   * The decorated form error handler.
   */
  protected FormErrorHandlerInterface $inner;

  /**
   * Constructs a login form error handler.
   */
  public function __construct(FormErrorHandlerInterface $inner) {
    $this->inner = $inner;
  }

  /**
   * {@inheritdoc}
   */
  public function handleFormErrors(array &$form, FormStateInterface $form_state) {
    if (($form['#form_id'] ?? NULL) === 'user_login_form') {
      return parent::handleFormErrors($form, $form_state);
    }

    return $this->inner->handleFormErrors($form, $form_state);
  }

  /**
   * Displays non-field login errors through Drupal's global messenger.
   */
  protected function displayErrorMessages(array $form, FormStateInterface $form_state): void {
    foreach ($form_state->getErrors() as $name => $error) {
      // These errors are rendered beside their login form elements.
      if (in_array($name, ['name', 'pass'], TRUE)) {
        continue;
      }

      $this->messenger()->addError($error);
    }
  }

}
