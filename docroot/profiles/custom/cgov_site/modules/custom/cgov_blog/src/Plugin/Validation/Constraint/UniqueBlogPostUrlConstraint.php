<?php

namespace Drupal\cgov_blog\Plugin\Validation\Constraint;

use Drupal\Core\Entity\Plugin\Validation\Constraint\CompositeConstraintBase;

/**
 * No two blog posts in the same series may share a pretty URL.
 *
 * @Constraint(
 *   id = "UniqueBlogPostUrl",
 *   label = @Translation("Blog post pretty URL is unique within its series.", context="Validation"),
 *   type = "entity:node"
 * )
 */
final class UniqueBlogPostUrlConstraint extends CompositeConstraintBase {

  /**
   * Shown when an editor picks a pretty URL already in use in this series.
   *
   * @var string
   */
  public $prettyUrlInUse = 'The Pretty URL is already in use for this blog series.';

  /**
   * {@inheritdoc}
   */
  public function coversFields() {
    return ['field_blog_series', 'field_pretty_url'];
  }

}
