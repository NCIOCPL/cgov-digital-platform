<?php

namespace Drupal\cgov_core\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Validates the UniqueCgovUrl Constraint.
 *
 * @package Drupal\cgov_core\Plugin\Validation\Constraint
 */
class UniqueCgovUrlConstraintValidator extends ConstraintValidator implements ContainerInjectionInterface
{

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
   * {@inheritdoc}
   */
  public function validate($entity, Constraint $constraint) {
    $isPopulatedSection = $entity->hasField('field_site_section') && isset($entity->get('field_site_section')->first()->getValue()['target_id']);
    $isPopulatedPrettyUrl = $entity->hasField('field_pretty_url') && isset($entity->get('field_pretty_url')->first()->value);

    if ($isPopulatedSection) {
      $site_section = $entity->get('field_site_section');
      // If both are populated, both values may only be used together once.
      if ($isPopulatedPrettyUrl) {

        $pretty_url = $entity->get('field_pretty_url');

        if ($this->isNotUniqueCombination($pretty_url, $site_section, $entity)) {
          $this->context->buildViolation($constraint->prettyUrlInUse)
            ->atPath('field_pretty_url')
            ->addViolation();
        }
      }
      else {
        // Only site section is populated only It's value needs to be Unique.
        if ($this->isNotUniqueEntityReference($site_section, $entity)) {
          $this->context->buildViolation($constraint->prettyUrlInUse)
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
   * {@inheritdoc}
   */
  public function isNotUniqueEntityReference($field, $entity) {
    $value = $field->first()->getValue()['target_id'];

    $field_name = $field->getFieldDefinition()->getName();
    $entity_type_id = $entity->getEntityTypeId();
    $id_key = $entity->getEntityType()->getKey('id');

    // The id could be NULL, so we cast it to 0 in that case.
    $value_taken = \Drupal::entityQuery($entity_type_id)
      ->condition($id_key, (int) $entity->id(), '<>')
      ->condition($field_name, $value)
      ->range(0, 1)
      ->count()
      ->execute();

    return $value_taken;
  }

  /**
   * {@inheritdoc}
   */
  public function isNotUniqueCombination($prettyURL, $section, $entity) {
    $section_value = $section->first()->getValue()['target_id'];
    $first_field_name = $prettyURL->getFieldDefinition()->getName();
    $entity_type_id = $entity->getEntityTypeId();
    $id_key = $entity->getEntityType()->getKey('id');

    $value_taken = (bool) \Drupal::entityQuery($entity_type_id)
      ->condition($id_key, (int) $entity->id(), '<>')
      ->condition('field_site_section', $section_value)
      ->condition($first_field_name, $prettyURL->first()->value)
      ->range(0, 1)
      ->count()
      ->execute();

    return $value_taken;
  }

}
