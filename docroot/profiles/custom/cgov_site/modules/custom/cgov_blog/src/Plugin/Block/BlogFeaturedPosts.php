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
 *   admin_label = @Translation("Cgov Blog Featured Posts"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogFeaturedPosts extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $featured[0] = [
      'title' => 'New Lung Cancer Target',
      'href' => 'xpol-kras-lung-target/',
      'date' => $this->t('February 2, 2017'),
      'author' => 'Amy E. Blum, M.A.',
    ];
    $featured[1] = [
      'title' => 'A tour of GDC DAVE',
      'href' => 'gdc-dave-tour/',
      'date' => $this->t('September 12, 2017'),
      'author' => 'Zhining Wang, Ph.D.',
    ];
    $featured[2] = [
      'title' => 'TCGA&apos;s PanCanAtlas',
      'href' => 'tcga-pancan-atlas/',
      'date' => $this->t('January 9, 2017'),
      'author' => 'Amy E. Blum, M.A.',
    ];

    $build = [
      '#featured' => $featured,
    ];
    return $build;
  }

}
