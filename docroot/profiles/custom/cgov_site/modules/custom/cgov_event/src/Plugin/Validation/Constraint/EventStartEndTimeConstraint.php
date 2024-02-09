<?php

namespace Drupal\cgov_event\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * Provides a StartEndTimeConstraint constraint.
 *
 * @Constraint(
 *   id = "CgovEventStartEndTimeConstraint",
 *   label = @Translation("EventStartEndTimeConstraint", context = "Validation"),
 * )
 */
class EventStartEndTimeConstraint extends Constraint {

  /**
   * Constraint error message.
   *
   * @var string
   */
  public $errorMessage = 'Start date and time must begin before event ends. Please select a start date and time that begins prior to the event end date and time.';

}
