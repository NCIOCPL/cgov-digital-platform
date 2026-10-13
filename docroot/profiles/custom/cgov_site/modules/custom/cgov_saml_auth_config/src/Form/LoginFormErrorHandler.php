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
      parent::handleFormErrors($form, $form_state);

      // Core gives the username field autofocus. Reset it so focus can follow
      // the first field that actually has an error.
      foreach (['name', 'pass'] as $element_name) {
        unset($form[$element_name]['#attributes']['autofocus']);
      }

      $focus_assigned = FALSE;
      foreach (['name', 'pass'] as $element_name) {
        if ($form_state->getError($form[$element_name])) {
          $error_id = $form[$element_name]['#id'] . '--error';
          $describedby = $form[$element_name]['#attributes']['aria-describedby'] ?? '';
          $describedby_ids = is_array($describedby)
            ? $describedby
            : preg_split('/\s+/', trim((string) $describedby), -1, PREG_SPLIT_NO_EMPTY);

          // Link the inline error to its input without discarding any existing
          // help-text references added by Drupal or another module.
          $form[$element_name]['#attributes']['class'][] = 'usa-input--error';
          $form[$element_name]['#attributes']['aria-describedby'] = implode(' ', array_unique([
            ...$describedby_ids,
            $error_id,
          ]));
          $form[$element_name]['#cgov_error_id'] = $error_id;

          if (!$focus_assigned) {
            // Focusing the invalid input causes assistive technology to read
            // the newly associated error after the failed submission.
            $form[$element_name]['#attributes']['autofocus'] = 'autofocus';
            $focus_assigned = TRUE;
          }
        }
      }

      return $this;
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
