<?php

namespace Drupal\json_data_field\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * JSON Data Field valid JSON Schema.
 *
 * Verifies that input values are valid JSON Schema.
 *
 * @Constraint(
 *   id = "valid_json_data_length",
 *   label = @Translation("Validate against JSONSchema ", context = "Validation")
 * )
 */
class ValidJsonDataLengthConstraint extends Constraint {

  /**
   * The default violation message.
   *
   * @var string
   */
  public $message = 'Yaml Content must be valid YAML Data.';

}
