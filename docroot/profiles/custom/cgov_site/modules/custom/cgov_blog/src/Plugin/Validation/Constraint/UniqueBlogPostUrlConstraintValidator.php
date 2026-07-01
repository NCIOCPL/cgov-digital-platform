<?php

namespace Drupal\cgov_blog\Plugin\Validation\Constraint;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Drupal\Core\Entity\EntityTypeManagerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\Validator\Constraint;
use Symfony\Component\Validator\ConstraintValidator;

/**
 * Checks that no two blog posts in the same series share a pretty URL.
 */
final class UniqueBlogPostUrlConstraintValidator extends ConstraintValidator implements ContainerInjectionInterface {

  /**
   * The entity type manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  private EntityTypeManagerInterface $entityTypeManager;

  public function __construct(EntityTypeManagerInterface $entityTypeManager) {
    $this->entityTypeManager = $entityTypeManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static($container->get('entity_type.manager'));
  }

  /**
   * {@inheritdoc}
   */
  public function validate($entity, Constraint $constraint) {
    if (!($constraint instanceof UniqueBlogPostUrlConstraint)) {
      return;
    }

    if ($entity->bundle() !== 'cgov_blog_post') {
      return;
    }

    $is_populated_series = $entity->hasField('field_blog_series') && !$entity->get('field_blog_series')->isEmpty();
    $is_populated_pretty_url = $entity->hasField('field_pretty_url') && !$entity->get('field_pretty_url')->isEmpty();

    if (!$is_populated_series || !$is_populated_pretty_url) {
      return;
    }

    $series_id = $entity->get('field_blog_series')->first()->getValue()['target_id'];
    $pretty_url = $entity->get('field_pretty_url')->value;
    $id_key = $entity->getEntityType()->getKey('id');

    $value_taken = (bool) $this->entityTypeManager
      ->getStorage('node')
      ->getQuery()
      ->accessCheck(FALSE)
      ->condition($id_key, (int) $entity->id(), '<>')
      ->condition('field_blog_series', $series_id)
      ->condition('field_pretty_url', $pretty_url)
      ->range(0, 1)
      ->count()
      ->execute();

    if ($value_taken) {
      $this->context->buildViolation($constraint->prettyUrlInUse)
        ->atPath('field_pretty_url')
        ->addViolation();
    }
  }

}
