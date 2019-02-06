<?php

namespace Drupal\cgov_site_section\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\EntityReferenceFieldItemListInterface;

/**
 * Validates the UniqueCgovUrl Constraint.
 *
 * @package Drupal\cgov_core\Plugin\Validation\Constraint
 */
class UniqueCgovUrlConstraintValidator extends ConstraintValidator implements ContainerInjectionInterface {

  /**
   * Validator 2.5 and upwards compatible execution context.
   *
   * @var \Symfony\Component\Validator\Context\ExecutionContextInterface
   */

  protected $context;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('entity.manager')->getStorage('node'));
  }

  /**
   * Validates the uniqueness of a Site Section and PrettyURL combination.
   *
   * @param mixed $entity
   *   The entity on which to check across for uniqueness.
   * @param \Symfony\Component\Validator\Constraint $constraint
   *   The constraint.
   *
   * @return null
   *   Follows convention and returns null.
   *
   * @throws \Drupal\Core\TypedData\Exception\MissingDataException
   *   Error for missing data.
   */
  public function validate($entity, Constraint $constraint) {
    $is_populated_section = $entity->hasField('field_site_section') && !empty($entity->get('field_site_section')->first()->getValue()['target_id']);
    $is_populated_pretty_url = $entity->hasField('field_pretty_url') && !empty($entity->get('field_pretty_url')->first()->value);

    if ($is_populated_section) {
      $site_section = $entity->get('field_site_section');
      // If both are populated, both values may only be used together once.
      if ($is_populated_pretty_url) {

        $pretty_url = $entity->get('field_pretty_url');

        if (!$this->isUniqueSectionUrlCombo($pretty_url, $site_section, $entity)) {
          $this->context->buildViolation($constraint->prettyUrlInUse)
            ->atPath('field_pretty_url')
            ->addViolation();
        }
      }
      else {
        // Only site section is populated, implying this is a landing page.
        // Validate this is the only item with this site
        // section and no Pretty URL.
        if (!$this->isUniqueLandingSection($site_section, $entity)) {
          $this->context->buildViolation($constraint->sectionInUse)
            ->atPath('field_site_section')
            ->addViolation();
        }

        return NULL;
      }
    }

    // If both the fields do not exist, do not validate anything.
    return NULL;
  }

  /**
   * Validate uniqueness, specifically for Section entity references fields.
   *
   * NOTE: There is a core validator 'UniqueFieldValueValidator' however it
   * does not handle entity reference validation.
   *
   * @param \Drupal\Core\Field\EntityReferenceFieldItemListInterface $field
   *   The entity reference field being checked for uniqueness.
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity on which to check across for uniqueness.
   *
   * @return bool
   *   Unique or not.
   *
   * @throws \Drupal\Core\TypedData\Exception\MissingDataException
   *   Error for missing data.
   */
  public function isUniqueLandingSection(EntityReferenceFieldItemListInterface $field, EntityInterface $entity) {

    $value_taken = NULL;

    if (!$field->isEmpty()) {
      // Get the target ID of the entity reference field.
      $value = $field->first()->getValue()['target_id'];

      // Get the field name.
      $field_name = $field->getFieldDefinition()->getName();

      // Get the storage key and entity type.
      $entity_type_id = $entity->getEntityTypeId();
      $id_key = $entity->getEntityType()->getKey('id');

      // Query for the conditions.
      // The id could be NULL, cast it to 0 in that case.
      $value_taken = (bool) \Drupal::entityQuery($entity_type_id)
        ->condition($id_key, (int) $entity->id(), '<>')
        ->condition($field_name, $value)
        ->notExists('field_pretty_url')
        ->range(0, 1)
        ->count()
        ->execute();
    }

    return !$value_taken;
  }

  /**
   * Validates that the combination of Cgov Section and URL is unique.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface $prettyURL
   *   The Pretty URL field.
   * @param \Drupal\Core\Field\FieldItemListInterface $section
   *   The Site Section field.
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity on which to check across for uniqueness.
   *
   * @return bool
   *   TRUE if Unique, FALSE otherwise.
   *
   * @throws \Drupal\Core\TypedData\Exception\MissingDataException
   *   Error for missing data.
   */
  public function isUniqueSectionUrlCombo(FieldItemListInterface $prettyURL, FieldItemListInterface $section, EntityInterface $entity) {
    // Get the value. Different if a field vs entity ref.
    $section_value = $section->first()->getValue()['target_id'];
    $pretty_url_value = $prettyURL->first()->value;

    // Get the actual fields machine name.
    $pretty_url_field_name = $prettyURL->getFieldDefinition()->getName();
    $section_field_name = $section->getFieldDefinition()->getName();

    // Get the storage key and entity type.
    $entity_type_id = $entity->getEntityTypeId();
    $id_key = $entity->getEntityType()->getKey('id');

    // Query for the conditions.
    // The id could be NULL, cast it to 0 in that case.
    $value_taken = (bool) \Drupal::entityQuery($entity_type_id)
      ->condition($id_key, (int) $entity->id(), '<>')
      ->condition($section_field_name, $section_value)
      ->condition($pretty_url_field_name, $pretty_url_value)
      ->range(0, 1)
      ->count()
      ->execute();

    return !$value_taken;
  }

}
