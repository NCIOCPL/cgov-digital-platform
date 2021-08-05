<?php

namespace Drupal\cgov_site_section\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\Language\LanguageManagerInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;

/**
 * Validates the Section ParentTerm Constraint.
 *
 * @package Drupal\cgov_core\Plugin\Validation\Constraint
 */
class SectionParentTermConstraintValidator extends ConstraintValidator implements ContainerInjectionInterface {

  /**
   * Validator 2.5 and upwards compatible execution context.
   *
   * @var \Symfony\Component\Validator\Context\ExecutionContextInterface
   */

  protected $context;

  /**
   * The term storage.
   *
   * @var \Drupal\taxonomy\TermStorageInterface
   */
  protected $termStorage;

  /**
   * The language manager service.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface
   */
  protected $languageManager;

  /**
   * The entity type manager.
   *
   * @param \Drupal\Core\Entity\EntityTypeManagerInterface $entity_type_manager
   *   The entity storage.
   * @param \Drupal\Core\Language\LanguageManagerInterface $language_manager
   *   The language manager service.
   */
  public function __construct(EntityTypeManagerInterface $entity_type_manager, LanguageManagerInterface $language_manager) {
    $this->termStorage = $entity_type_manager->getStorage('taxonomy_term');;
    $this->languageManager = $language_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('entity.manager'), $container->get('language_manager'));

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
   * Validates the uniqueness of a Site Section Parent Term.
   *
   * @param mixed $entity
   *   The entity on which to check across for uniqueness.
   * @param \Symfony\Component\Validator\Constraint $constraint
   *   The constraint.
   *
   * @throws \Drupal\Core\TypedData\Exception\MissingDataException
   *   Error for missing data.
   */
  public function validate($entity, Constraint $constraint) {

    $formData = $entity->getEntity()->toArray();

    $parentItems = $this->getParentTargets($formData);

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
      $this->context->addViolation($constraint->duplicateRootErrorMsg);
    }
  }

}
