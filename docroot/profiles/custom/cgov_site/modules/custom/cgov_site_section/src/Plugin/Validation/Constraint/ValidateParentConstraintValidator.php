<?php

namespace Drupal\cgov_site_section\Plugin\Validation\Constraint;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Validates the ValidateParentConstraintValidator constraint.
 */
class ValidateParentConstraintValidator extends ConstraintValidator implements ContainerInjectionInterface {

  /**
   * The term storage.
   *
   * @var \Drupal\taxonomy\TermStorageInterface
   */
  protected $termStorage;

  /**
   * Constructs an ValidateParentConstraintValidator object.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity storage.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager) {
    $this->termStorage = $entity_type_manager->getStorage('taxonomy_term');
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
        $container->get('entity_type.manager')
      );
  }

  /**
   * Checks parent field validation.
   *
   * @param mixed $field
   *   The field/value that should be validated.
   * @param \Symfony\Component\Validator\Constraint $constraint
   *   The constraint for the validation.
   */
  public function validate($field, Constraint $constraint) {

    if (!($constraint instanceof ValidateParentConstraint)) {
      return NULL;
    }
    $formData = $field->getEntity()->toArray();
    $parentItems = $this->getParentTargets($formData);
    if (!$this->checkChildUniqueName($formData, $parentItems)) {
      $this->context->addViolation($constraint->uniqueChildName);
    }

    // Check for duplicate child name in same language.
    if (count($parentItems) > 1) {
      // More than one parent, we can't check correctly, so error.
      $this->context->addViolation($constraint->duplicateParentSetErrorMsg);
    }
    elseif (count($parentItems) === 1 && $parentItems[0] !== 0) {
      // Has a parent that is not the root, this is ok, skipping extra work.
      return;
    }

    // NOTE: If we are here, we are going to be a root term.
    $languageRoots = $this->getLanguageRoots();
    // This is the langcode of the entity trying to be saved.
    $langcode = $formData['langcode'][0]['value'];

    // If this entity was saved before, we also want to know the previous
    // language, since someone could be changing it.
    $tid = NULL;
    if (isset($formData['tid'][0]['value'])) {
      $tid = $formData['tid'][0]['value'];
    }

    // If there is already a root term for the entities language, and
    // the terms being saved is NOT that root term, then log a
    // validation error.
    if (array_key_exists($langcode, $languageRoots) && $languageRoots[$langcode] !== $tid) {
      $this->context->addViolation($constraint->errorMessage);
    }

  }

  /**
   * Gets all the target ids of the parents.
   *
   * @param mixed $formData
   *   The data for the entity.
   *
   * @return mixed
   *   An array of the target_ids of the parents.
   */
  private function getParentTargets($formData) {
    // No parent was set.
    if (!$formData['parent'] || !is_array($formData['parent'])) {
      return [];
    }

    $parentTargets = array_map(function ($parent) {
      return intval($parent['target_id']);
    }, $formData['parent']);

    return $parentTargets;
  }

  /**
   * Gets the complete list of all the terms at the root level by language.
   *
   * @return mixed
   *   Array of langcodes that have a root taxonomy term.
   */
  public function getLanguageRoots() {
    // Find all root terms.
    $vid = 'cgov_site_sections';
    $terms = $this->termStorage->loadTree($vid, 0, 1);
    $languageRoots = [];
    foreach ($terms as $term) {
      $languageRoots[$term->langcode] = $term->tid;
    }
    return $languageRoots;
  }

  /**
   * Check Child Unique Name.
   *
   * @return bool
   *   Boolean.
   */
  public function checkChildUniqueName($formData, $parentItems) {
    $name = $formData['name'][0]['value'];
    $langcode = $formData['langcode'][0]['value'];
    $tid = !empty($formData['tid']) ? $formData['tid'][0]['value'] : '';
    if (count($parentItems) === 1) {
      $vid = 'cgov_site_sections';
      $terms = $this->termStorage->loadTree($vid, $formData['parent'][0]['target_id'], 1);
      foreach ($terms as $term) {
        if ($term->name === $name && $term->tid !== $tid && $langcode === $term->langcode) {
          return FALSE;
        }
      }
    }
    return TRUE;
  }

}
