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
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManager
   */
  protected $entityTypeManager;

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
    $this->entityTypeManager = $entity_type_manager;
    $this->languageManager = $language_manager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('entity.manager'), $container->get('language_manager'));

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
    $langcode = $formData['langcode'][0]['value'];
    if (isset($formData['tid'][0]['value'])) {
      $tid = $formData['tid'][0]['value'];
      $currlangcode = $this->entityTypeManager->getStorage('taxonomy_term')->load($tid)->get('langcode')->value;
    }
    else {
      $tid = $currlangcode = '';
    }
    // Get active languages in site.
    $langcodes = $this->languageManager->getLanguages();
    $langcodesList = array_keys($langcodes);
    $vid = 'cgov_site_sections';

    // Get existing terms.
    $terms = $this->entityTypeManager->getStorage('taxonomy_term')->loadTree($vid);
    $parentTermCount = 0;
    foreach ($terms as $term) {
      $existLangCodes[] = $term->langcode;
      if ($term->depth == 0 && in_array($term->langcode, $langcodesList) && $tid != $term->tid) {
        $parentTermCount++;
      }
    }

    // Get parent terms.
    foreach ($formData['parent'] as $parents) {
      $parentItems[] = $parents['target_id'];
    }
    if (in_array(0, $parentItems)) {
      if ($parentTermCount >= 1 && in_array($langcode, $existLangCodes) && $langcode != $currlangcode) {
        $this->context->addViolation($constraint->sectionParentTerm);
      }
    }
  }

}
