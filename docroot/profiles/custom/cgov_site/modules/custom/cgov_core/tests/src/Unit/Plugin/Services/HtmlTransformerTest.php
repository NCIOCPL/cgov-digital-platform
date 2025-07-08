<?php

namespace Drupal\Tests\cgov_core\Unit\Plugin\Services;

use Drupal\cgov_core\Services\FeatureCardViewModeTransformer;
use Drupal\cgov_core\Services\NoBulletsToBulletsTransformer;
use Drupal\cgov_core\Services\RemoveImageCarouselTransformer;
use Drupal\cgov_core\Services\RemoveMsoBidiThemeFontTransformer;
use Drupal\cgov_core\Services\RemoveMsoBodyTextTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Page Options Manager Service.
 *
 * @group cgov_core
 */
class HtmlTransformerTest extends UnitTestCase {

  /**
   * Tests transforming class `no-bullets` to `bullets`.
   *
   * @covers:transform
   */
  public function testTransformBullets() {
    $converter = new NoBulletsToBulletsTransformer();
    $input = '<p class="no-bullets">This is placeholder text.</p>';
    $output = $converter->transform($input);
    // You are going to change this.
    $expected = '<p class="bullets">This is placeholder text.</p>';

    $this->assertEquals($expected, $output, 'This should convert a single definition with PDQ structure mess.');
  }

  /**
   * Tests removal of `MsoBodyText`.
   *
   * @covers:transform
   */
  public function testTransformMsoBodyText() {
    $converter = new RemoveMsoBodyTextTransformer();
    $input = '<p class="MsoBodyText">This is placeholder text.</p>';
    $output = $converter->transform($input);
    // You are going to change this.
    $expected = '<p>This is placeholder text.</p>';

    $this->assertEquals($expected, $output, 'This should convert a single definition with PDQ structure mess.');
  }

  /**
   * Tests transform method for embedded feature cards.
   *
   * @covers:transform
   */
  public function testTransformEmbeddedFeatureCard() {
    $converter = new FeatureCardViewModeTransformer();
    $input = '<div data-embed-button="cgov_featured_content_button" data-entity-embed-display="view_mode:node.embedded_feature_card" data-entity-type="node" data-entity-uuid="0ff7120f-91a5-41aa-979c-f2171c3f3db5" class="align-right embedded-entity" data-langcode="en" data-entity-embed-display-settings="[]"><div class="feature-card"><a href="/publications/patient-education/guide-for-parents"><div class="image-hover"><img loading="lazy" src="/sites/g/files/xnrzdm211/files/styles/cgov_featured/public/cgov_image/featured/100/400/1/files/children-cancer-guide-feature-card.jpg?itok=60_ADO_I" width="425" height="319" alt="Cover of a National Cancer Institute guidebook titled &quot;Children with Cancer: A Guide for Parents&quot; featuring a colorful collage of photos showing children, families, and healthcare workers in various supportive settings."></div><h3>Children with Cancer: A Guide for Parents</h3><p>Practical information about childhood cancer, treatment, coping, and more for parents and health care providers.</p></a></div></div>';
    $output = $converter->transform($input);
    // You are going to change this.
    $expected = '<div data-embed-button="cgov_featured_content_button" data-entity-embed-display="view_mode:node.embedded_feature_card_no_image" data-entity-type="node" data-entity-uuid="0ff7120f-91a5-41aa-979c-f2171c3f3db5" class="align-right embedded-entity" data-langcode="en" data-entity-embed-display-settings="[]"><div class="feature-card"><a href="/publications/patient-education/guide-for-parents"><div class="image-hover"><img loading="lazy" src="/sites/g/files/xnrzdm211/files/styles/cgov_featured/public/cgov_image/featured/100/400/1/files/children-cancer-guide-feature-card.jpg?itok=60_ADO_I" width="425" height="319" alt="Cover of a National Cancer Institute guidebook titled &quot;Children with Cancer: A Guide for Parents&quot; featuring a colorful collage of photos showing children, families, and healthcare workers in various supportive settings."></div><h3>Children with Cancer: A Guide for Parents</h3><p>Practical information about childhood cancer, treatment, coping, and more for parents and health care providers.</p></a></div></div>';

    $this->assertEquals($expected, $output, 'This should convert a single definition with PDQ structure mess.');
  }

  /**
   * Tests removal of `ic-carousel`.
   *
   * @covers:transform
   */
  public function testTransformCarousel() {
    $converter = new RemoveImageCarouselTransformer();
    $input = '<div class="testing"><div class="ic-carousel">This is placeholder text.</div></div>';
    $output = $converter->transform($input);
    // You are going to change this.
    $expected = '<div class="testing"><div>This is placeholder text.</div></div>';

    $this->assertEquals($expected, $output, 'This should convert a single definition with PDQ structure mess.');
  }

  /**
   * Tests removal of `mso-bidi-theme-font:minor-latin`.
   *
   * @covers:transform
   */
  public function testTransformMsoBidiThemeFont() {
    $converter = new RemoveMsoBidiThemeFontTransformer();
    $input = '<span style="mso-bidi-font-family:"Noto Sans";mso-bidi-theme-font:minor-latin;"><strong>Radiation therapy and cisplatin:</strong></span>';
    $output = $converter->transform($input);
    // You are going to change this.
    $expected = '<span style="mso-bidi-font-family:"Noto Sans";"><strong>Radiation therapy and cisplatin:</strong></span>';

    $this->assertEquals($expected, $output, 'This should convert a single definition with PDQ structure mess.');
  }

}
