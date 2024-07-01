<?php

namespace Drupal\cgov_site_section\Plugin\Validation\Constraint;

use Drupal\Core\Entity\Plugin\Validation\Constraint\CompositeConstraintBase;

/**
 * Constraint validating and restrict to add root entry in Site Section.
 *
 * @Constraint(
 *   id = "SectionParentTerm",
 *   label = @Translation("Parent root only for home sites", context="Validation",
 *   type = "entity:node")
 * )
 */
class SectionParentTermConstraint extends CompositeConstraintBase {

  /**
   * Error message for duplicate roots.
   *
   * @var string
   */
  public $duplicateRootErrorMsg = 'The site section cannot be saved. Please set the parent site section under the Relations tab.';

  /**
   * Error message for duplicate parents.
   *
   * @var string
   */
  public $duplicateParentSetErrorMsg = 'The site section cannot be saved. Please select only one parent site section under the Relations tab.';

  /**
   * {@inheritdoc}
   */
  public function coversFields() {
    return ['parent'];
  }

}
