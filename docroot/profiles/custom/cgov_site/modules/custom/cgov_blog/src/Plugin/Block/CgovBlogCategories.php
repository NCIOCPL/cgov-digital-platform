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
      '#markup' => $this->t('
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/biology">Biology of Cancer</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/cancer-risk">Cancer Risk</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/childhood-cancer">Childhood Cancer</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/clinical-trial-results">Clinical Trial Results</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/disparities">Disparities</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/fda-approvals">FDA Approvals</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/global-health">Global Health</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/leadership-expert-views">Leadership &amp; Expert Views</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/prevention">Prevention</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/prognosis">Prognosis</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/screening-early-detection">Screening &amp; Early Detection</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/survivorship-supportive-care">Survivorship &amp; Supportive Care</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/technology">Technology</a></div>
        </li>
        <li class="general-list-item general list-item">
            <div class="title-and-desc title desc container"><a class="title" href="/news-events/cancer-currents-blog/treatment">Treatment</a></div>
        </li>
      '),
    ];
    return $build;
  }

}
