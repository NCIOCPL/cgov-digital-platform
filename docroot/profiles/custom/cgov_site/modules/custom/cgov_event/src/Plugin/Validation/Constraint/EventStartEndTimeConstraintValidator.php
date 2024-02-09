<?php

namespace Drupal\cgov_event\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the EventStartEndTimeConstraint constraint.
 */
class EventStartEndTimeConstraintValidator extends ConstraintValidator {

  /**
   * Checks if end date is later than start date.
   *
   * @param mixed $field
   *   The field/value that should be validated.
   * @param \Symfony\Component\Validator\Constraint $constraint
   *   The constraint for the validation.
   */
  public function validate($field, Constraint $constraint) {
    // Get field's parent entity to access other fields on this entity.
    /** @var \Drupal\node\Entity\Node $entity */
    $entity = $field->getEntity();
    if ($entity &&
        $entity->hasField('field_event_start_date') &&
        $entity->hasField('field_event_end_date')
    ) {
      if (!($constraint instanceof EventStartEndTimeConstraint)) {
        return NULL;
      }
      // Get the datetime object in correct timezone of the starting time.
      /** @var \Drupal\Core\Datetime\DrupalDateTime $dateTimeBegin */
      $dateTimeBegin = $entity->field_event_start_date->date;
      // Get the datetime object in correct timezone of the end time.
      /** @var \Drupal\Core\Datetime\DrupalDateTime $dateTimeEnd */
      $dateTimeEnd = $entity->field_event_end_date->date;

      // Display an error message, if end time is not later than start time.
      if ($dateTimeEnd < $dateTimeBegin) {
        $this->context->buildViolation($constraint->errorMessage)
          ->atPath('field_event_end_date')
          ->addViolation();
      }
    }
  }

}
