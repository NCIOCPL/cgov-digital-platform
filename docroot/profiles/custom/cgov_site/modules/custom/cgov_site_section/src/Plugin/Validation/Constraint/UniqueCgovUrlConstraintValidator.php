<?php

namespace Drupal\cgov_site_section\Plugin\Validation\Constraint;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Drupal\Core\Field\EntityReferenceFieldItemListInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\taxonomy\Entity\Term;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

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
   * Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('entity_type.manager'));
  }

  /**
   * Constructs an UniqueCgovUrlConstraintValidator object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity type manager.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->entityTypeManager = $entity_type_manager;
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
    if (!($constraint instanceof UniqueCgovUrlConstraint)) {
      return NULL;
    }

    if ($entity instanceof FieldItemListInterface && $entity->getEntity() instanceof Term && $entity->getEntity()->hasField('field_pretty_url')) {
      // Validate a URL which is generated based on pretty URL & computed path
      // also check its uniqueness for both path aliases & term hierarchy.
      $result = $this->validateSiteSectionComputedPath($entity->getEntity());
      if ($result) {
        $this->context->addViolation($constraint->uniquePrettyUrl);
      }
      return;
    }
    $is_populated_section = $entity->hasField('field_site_section') && !empty($entity->get('field_site_section')->first());
    $is_populated_pretty_url = $entity->hasField('field_pretty_url') && !empty($entity->get('field_pretty_url')->first());
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
   * Method to validate paths for site sections.
   *
   * @param \Drupal\Core\Entity\ContentEntityInterface $entity
   *   Site section term.
   *
   * @return bool
   *   List of term ids or empty array.
   */
  public function validateSiteSectionComputedPath(ContentEntityInterface $entity) {
    $prettyUrl = $entity->get('field_pretty_url')->value;
    /** @var \Drupal\Core\Entity\ContentEntityInterface $parentEntity */
    $parentEntity = $entity->get('parent')->entity;
    if (empty($prettyUrl) || ($parentEntity == NULL)) {
      return [];
    }
    $parentComputedPath = $parentEntity->get('computed_path')->value;
    if ($parentComputedPath === '/') {
      $parentComputedPath = '';
    }
    $currentComputedPath = empty($parentComputedPath) ? '/' . $prettyUrl : $parentComputedPath . '/' . $prettyUrl;

    $query = $this->entityTypeManager->getStorage('taxonomy_term')->getQuery()
      ->condition('vid', $entity->bundle())
      ->accessCheck(FALSE)
      ->condition('computed_path', $currentComputedPath);
    // Exclude the current term if it exists.
    if (!$entity->isNew()) {
      $query->condition('tid', $entity->id(), '!=');
    }
    $result = $query->execute();
    $alias_ids = [];
    // Create an entity query for the 'path_alias' entity.
    if ($entity->isNew()) {
      $aliasChecker = $this->entityTypeManager->getStorage('path_alias')
        ->getQuery()
        ->accessCheck(FALSE)
        ->condition('alias', $currentComputedPath);
      // Execute the query to get the path alias ID(s).
      $alias_ids = $aliasChecker->execute();
    }
    $output = (!empty($result) || !empty($alias_ids)) ? TRUE : FALSE;

    return $output;
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
      $query = $this->entityTypeManager
        ->getStorage($entity_type_id)
        ->getQuery();
      $value_taken = (bool) $query
        ->accessCheck(FALSE)
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
    $pretty_url_value = $prettyURL->value;
    // Get the actual fields machine name.
    $pretty_url_field_name = $prettyURL->getFieldDefinition()->getName();
    $section_field_name = $section->getFieldDefinition()->getName();

    // Get the storage key and entity type.
    $entity_type_id = $entity->getEntityTypeId();
    $id_key = $entity->getEntityType()->getKey('id');

    // Query for the conditions.
    // The id could be NULL, cast it to 0 in that case.
    $query = $this->entityTypeManager
      ->getStorage($entity_type_id)
      ->getQuery();
    $value_taken = (bool) $query
      ->accessCheck(FALSE)
      ->condition($id_key, (int) $entity->id(), '<>')
      ->condition($section_field_name, $section_value)
      ->condition($pretty_url_field_name, $pretty_url_value)
      ->range(0, 1)
      ->count()
      ->execute();

    return !$value_taken;
  }

}
