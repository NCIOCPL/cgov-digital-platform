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
 *   admin_label = @Translation("Ggov Blog Featured Posts block"),
 *   category = @Translation("Cgov Digital Platform"),
 * )
 */
class BlogFeaturedPosts extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#markup' => $this->t('
      <li class="general-list-item general list-item">
        <div class="title-and-desc title desc container">
            <a class="title" href="#xpo1-kras-lung-target">New Lung Cancer Target</a>
            <div class="byline">
                <p>February 2, 2017, by Amy E. Blum, M.A.</p>
            </div>
        </div>
      </li>
      <li class="general-list-item general list-item">
        <div class="title-and-desc title desc container">
            <a class="title" href="#gdc-dave-tour">A tour of GDC DAVE</a>
            <div class="byline">
                <p>September 12, 2017, by Zhining Wang, Ph.D.</p>
            </div>
        </div>
      </li>
      <li class="general-list-item general list-item">
        <div class="title-and-desc title desc container">
            <a class="title" href="#tcga-pancan-atlas">TCGA&apos;s PanCanAtlas</a>
            <div class="byline">
                <p>January 9, 2017, by Amy E. Blum, M.A.</p>
            </div>
        </div>
      </li>
      '),
    ];
    return $build;
  }

}
