<?php

namespace Drupal\cgov_blog\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/**
 * Provides a block for the Cgov Blog right rail archive.
 *
 * @Block(
 *   id = "cgov_blog_archive",
 *   admin_label = @Translation("Blog Archive block"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class CgovBlogArchive extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#type' => 'block',
      '#markup' => $this->t('=== debug CgovBlogArchive #markup ==='),
    ];
    return $build;
  }

}
