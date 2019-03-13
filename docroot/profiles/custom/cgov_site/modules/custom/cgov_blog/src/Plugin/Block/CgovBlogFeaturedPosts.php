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
        <div class="contentid-1070871 slot-item first-SI">
            <div class="managed list with-date">
                <p id="Featured+Posts" tabindex="0" class="title">Featured Posts</p>
                <ul>
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
                </ul>
            </div>
        </div>
        <div class="contentid-1070868 slot-item last-SI">
            <span>
                <div class="desktop">
                    <div id="blog-archive-accordion">
                    <h3 id="archive" class="blog-archive-header">Archive</h3>
                    <div id="blog-archive-accordion-year">
                        <ul>
                            <li class="year"><a class href="?filter[year]=2019">2019</a> (2)</li>
                            <li class="year"><a class href="?filter[year]=2018">2018</a> (10)</li>
                            <li class="year"><a class href="?filter[year]=2017">2017</a> (10)</li>
                            <li class="year"><a class href="?filter[year]=2016">2016</a> (14)</li>
                        </ul>
                    </div>
                    </div>
                </div>
            </span>
        </div>
      '),
    ];
    return $build;
  }

}
