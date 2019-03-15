<?php

namespace Drupal\cgov_core\Plugin\Block;

use Drupal\Core\Block\BlockBase;

/*
 * NOTE: this is a dummy plugin for front-end templating only.
 * The innards are still being built out.
 */

/**
 * Provides a Recommended Content block.
 *
 * @Block(
 *  id = "cgov_recommended_content",
 *  admin_label = @Translation("Cgov Recommended Content"),
 *  category = @Translation("Cgov Digital Platform"),
 * )
 */
class RecommendedContent extends BlockBase {

  /**
   * {@inheritdoc}
   */
  public function build() {
    $build = [
      '#markup' => $this->t('
        <div id="blog-cards">
            <h4>Recommended From NCI</h4>
            <div id="nvcgSlLayoutFeatureA" class="row flex-columns">
                <div class="contentid-1073806 slot-item first-SI equalheight large-4 columns card gutter blog-feature">
                    <div class="feature-card cgvBlogPost">
                    <a href="/news-events/cancer-currents-blog/2017/lung-cancer-screening-challenges">
                        <div class="image-hover">
                            <img src="/sites/default/files/styles/thumbnail/public/2019-03/sad-woman-article.jpg" alt="CT scan image of lungs">
                        </div>
                        <h3>Lung Cancer Screening Project Reveals Challenges</h3>
                    </a>
                    </div>
                </div>
                <div class="contentid-1108310 slot-item equalheight large-4 columns card gutter blog-feature">
                    <div class="feature-card cgvBlogPost">
                    <a href="/news-events/cancer-currents-blog/2018/lung-cancer-screening-identifying-who-benefits">
                        <div class="image-hover">
                            <img src="/sites/default/files/2019-03/ocean-sunset-view-mykonos-thumb.jpg" alt="">
                        </div>
                        <h3>Lung Cancer Screening May Benefit Those at Highest Risk</h3>
                    </a>
                    </div>
                </div>
                <div class="contentid-1051873 slot-item last-SI equalheight large-4 columns card gutter blog-feature">
                    <div class="feature-card cgvBlogPost">
                    <a href="/news-events/cancer-currents-blog/2016/risk-profile-lung-screening">
                        <div class="image-hover">
                            <img src="/sites/default/files/styles/thumbnail/public/2019-03/pet_frisco_king_of_snp.jpg" alt="">
                        </div>
                        <h3>Improving Lung Cancer Screening</h3>
                    </a>
                    </div>
                </div>
            </div>
        </div>
      '),
    ];
    return $build;
  }

}
