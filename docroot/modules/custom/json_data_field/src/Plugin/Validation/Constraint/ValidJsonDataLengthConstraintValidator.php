<?php

namespace Drupal\json_data_field\Plugin\Validation\Constraint;

use Drupal\json_data_field\Plugin\Field\FieldType\JsonDataFieldItem;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Checks if YAML values are valid.
 */
class ValidJsonDataLengthConstraintValidator extends ConstraintValidator {

  /**
   * {@inheritdoc}
   */
  public function validate($value, Constraint $constraint) {
    // Empty should be handled by the field settings.
    if (empty($value->value)) {
      return;
    }

    // Use json_encode() to convert the array into json data.
    $json_data = json_encode($value->value);
    $max_length = JsonDataFieldItem::SIZE;
    $json_data_size = strlen($json_data);

    // Validate the json data length.
    if ($json_data_size > $max_length) {
      $this->context->addViolation('The YAML text may not be longer than @max characters', ['@max' => $max_length]);
    }
  }

}
