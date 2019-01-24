<?php

namespace Drupal\cgov_core\Plugin\Validation\Constraint;

use Drupal\Core\Entity\Plugin\Validation\Constraint\CompositeConstraintBase;

/**
 * A composite contraint.
 *
 * @Constraint(
 *   id = "UniqueCgovUrl",
 *   label = @Translation("Pretty URL is unique.", context="Validation",
 *   type = "entity:node")
 * )
 */
class UniqueCgovUrlConstraint extends CompositeConstraintBase {


  /**
   * {@inheritdoc}
   */
  public $prettyUrlInUse = 'The Pretty URL is already in use for this section.';


  /**
   * {@inheritdoc}
   */
  public $sectionInUse = 'This section already has a landing page';

  /**
   * {@inheritdoc}
   */
  public function coversFields() {
    return ['field_site_section', 'field_pretty_url'];
  }

}
