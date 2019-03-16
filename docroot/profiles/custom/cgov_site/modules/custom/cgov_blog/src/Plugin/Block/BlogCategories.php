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
 *   id = "cgov_blog_categories",
 *   admin_label = @Translation("Cgov Blog Categories"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogCategories extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#markup' => $this->t('

        <b>foo bar baz</b>

      '),
    ];
    return $build;
  }

}
