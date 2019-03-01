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
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="#">Vitamin D Supplements Don’t Reduce Cancer Incidence</a>
                <div class="byline">
                    <p>December 13, 2018, by NCI Staff</p>
                </div>
            </div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="#">Two Radiation Therapy Approaches Prevent Breast Cancer Recurrences</a>
                <div class="byline">
                    <p>December 19, 2018, by NCI Staff</p>
                </div>
            </div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="#">Developing Better Approaches for Managing Cancer Pain</a>
                <div class="byline">
                    <p>January 23, 2019, by NCI Staff</p>
                </div>
            </div>
        </li>
      '),
    ];
    return $build;
  }

}
