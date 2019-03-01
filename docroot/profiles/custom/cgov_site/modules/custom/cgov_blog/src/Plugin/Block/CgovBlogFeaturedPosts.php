<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/*
 * NOTE: this is a dummy plugin for front-end templating only.
 * The innards are still being built out.
 */

/**
 * Provides a Featured Posts Block.
 *
 * @Block(
 *   id = "cgov_blog_featured_posts",
 *   admin_label = @Translation("Blog Categories block"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class CgovBlogFeaturedPosts extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#markup' => $this->t('
          Vitamin D Supplements Don’t Reduce Cancer Incidence
          December 13, 2018, by NCI Staff
          Two Radiation Therapy Approaches Prevent Breast Cancer Recurrences
          December 19, 2018, by NCI Staff
          Developing Better Approaches for Managing Cancer Pain
          January 23, 2019, by NCI Staff
      '),
    ];
    return $build;
  }

}
