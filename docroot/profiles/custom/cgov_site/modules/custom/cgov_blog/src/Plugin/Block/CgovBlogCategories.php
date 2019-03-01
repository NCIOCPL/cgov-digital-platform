<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/*
 * NOTE: this is a dummy plugin for front-end templating only.
 * The innards are still being built out.
 */

/**
 * Provides a Blog Categories Block.
 *
 * @Block(
 *   id = "cgov_blog_categories",
 *   admin_label = @Translation("Blog Categories block"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class CgovBlogCategories extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#markup' => $this->t(
        'Biology of Cancer, Cancer Risk, Childhood Cancer, Clinical Trial Results, Disparities, FDA Approvals, Global Health, Leadership & Expert Views, Prevention, Prognosis, Screening & Early Detection, Survivorship & Supportive Care, Technology, Treatment
      '),
    ];
    return $build;
  }

}
