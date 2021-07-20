<?php

namespace Drupal\cgov_site_section\Plugin\Validation\Constraint;

use Drupal\Core\Entity\Plugin\Validation\Constraint\CompositeConstraintBase;

/**
 * A composite constraint validating Site Section Parent Term.
 *
 * @Constraint(
 *   id = "SectionParentTerm",
 *   label = @Translation("Paret root only for home sites", context="Validation",
 *   type = "entity:node")
 * )
 */
class SectionParentTermConstraint extends CompositeConstraintBase {

  /**
   * {@inheritdoc}
   */
  public $sectionParentTerm = 'The site section cannot be saved. Please set the parent site section under the Relations tab.';

  /**
   * {@inheritdoc}
   */
  public function coversFields() {
    return ['parent'];
  }

}
