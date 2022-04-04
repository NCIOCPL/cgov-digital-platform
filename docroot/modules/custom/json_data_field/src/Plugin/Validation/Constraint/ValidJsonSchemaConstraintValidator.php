<?php

namespace Drupal\json_data_field\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use JsonSchema\Validator;

/**
 * Checks if YAML values are valid.
 */
class ValidJsonSchemaConstraintValidator extends ConstraintValidator {

  /**
   * The schema validator.
   *
   * This property will only be set if the validator library is available.
   *
   * @var \JsonSchema\Validator|null
   */
  protected $validator;

  /**
   * {@inheritdoc}
   */
  public function validate($value, Constraint $constraint) {
    // Empty should be handled by the field settings.
    if (empty($value->value)) {
      return;
    }

    // Get the YAML input data entered by user.
    // Converts the input array to object.
    $data = json_encode($value->value);
    $response_data = json_decode($data);

    // Get the json_data_field JsonSchema file.
    $field_storage_settings = $value->getFieldDefinition()->getSettings();

    $field_name = $value->getFieldDefinition()->id();

    if (empty($field_storage_settings)) {
      return;
    }

    $schema_uri = $field_storage_settings['json_schema_file'] ?? '';
    // Check if JSONSchema file exists in the system.
    if (!file_exists($schema_uri)) {
      $this->context->addViolation('Field @field_name has an invalid JSONSchema @uri',
      ['@field_name' => $field_name, '@uri' => $schema_uri]);
      return FALSE;
    }
    $json_schema = (object) ['$ref' => $schema_uri];
    return $this->validateSchema($response_data, $json_schema, $constraint);
  }

  /**
   * Validates a string against a JSON Schema. It logs any possible errors.
   *
   * @param object $response_data
   *   The JSON string to validate.
   * @param string $schema
   *   The JSON schema.
   * @param object $constraint
   *   The constraint object.
   *
   * @return bool
   *   TRUE if the string is a valid instance of the schema. FALSE otherwise.
   */
  protected function validateSchema($response_data, $schema, $constraint) {

    $validator = new Validator();
    // Validate the YAML data against the JsonSchema.
    $validator->validate($response_data, $schema);
    $is_valid = $validator->isValid();

    if (!$is_valid) {
      $this->context->addViolation($constraint->message);
    }
    return $is_valid;
  }

}
