<?php

namespace Drupal\cgov_site_section\Plugin\Validation\Constraint;

use Symfony\Component\Validator\Constraint;

/**
 * A composite constraint validating Site Section parent.
 *
 * @Constraint(
 *   id = "CgovValidateParentConstraint",
 *   label = @Translation("ValidateParentConstraint", context="Validation"),
 * )
 */
class ValidateParentConstraint extends Constraint {

  /**
   * {@inheritdoc}
   */
  public $errorMessage = "The site section cannot be saved. There is already a site section at the root (the homepage). Please update the parent site section under the Relations tab to a section other than 'root'";

  /**
   * Error message for duplicate parents.
   *
   * @var string
   */
  public $duplicateParentSetErrorMsg = 'The site section cannot be saved. Site sections must only have one (1) parent.';

  /**
   * Unique Child Name of Parent.
   *
   * @var string
   */
  public $uniqueChildName = 'The site section cannot be saved. Site sections with the same parent must have unique name';

}
