<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsEmbeddedEntitiesTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Embedded Entities Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsEmbeddedEntitiesTransformer
 */
class NcidsEmbeddedEntitiesTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsEmbeddedEntitiesTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsEmbeddedEntitiesTransformer();
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<drupal-entity ' .
        'data-align="right" data-langcode="en" data-entity-type="media" ' .
        'data-entity-uuid="a3e3d87e-bf7f-4100-b23d-e103fa91fd82" data-embed-button="cgov_image_button" ' .
        'data-entity-embed-display="view_mode:media.image_display_article_medium" data-entity-embed-display-settings=""' .
      '>&nbsp;</drupal-entity>' .
      '<div class="chicken"><p>This is not an embed.</p></div>';
    $expected_html =
      '<drupal-entity ' .
        'data-align="right" data-langcode="en" data-entity-type="media" ' .
        'data-entity-uuid="a3e3d87e-bf7f-4100-b23d-e103fa91fd82" data-embed-button="cgov_image_button" ' .
        'data-entity-embed-display="view_mode:media.image_display_article_medium" data-entity-embed-display-settings ' .
        'data-html-transformer="NcidsEmbeddedEntitiesTransformer"' .
      '>&nbsp;</drupal-entity>' .
      '<div class="chicken"><p>This is not an embed.</p></div>';

    $processed_html = $this->transformer->preProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Test postProcessHtml method.
   *
   * @covers ::postProcessHtml
   */
  public function testPostProcessHtml() {
    $original_html =
      '<drupal-entity ' .
        'data-align="right" data-langcode="en" data-entity-type="media" ' .
        'data-entity-uuid="a3e3d87e-bf7f-4100-b23d-e103fa91fd82" data-embed-button="cgov_image_button" ' .
        'data-entity-embed-display="view_mode:media.image_display_article_medium" data-entity-embed-display-settings ' .
        'data-html-transformer="NcidsEmbeddedEntitiesTransformer"' .
      '>&nbsp;</drupal-entity>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not an embed.</p></div>';
    $expected_html =
      '<drupal-entity ' .
        'data-align="right" data-langcode="en" data-entity-type="media" ' .
        'data-entity-uuid="a3e3d87e-bf7f-4100-b23d-e103fa91fd82" data-embed-button="cgov_image_button" ' .
        'data-entity-embed-display="view_mode:media.image_display_article_medium" data-entity-embed-display-settings' .
      '>&nbsp;</drupal-entity>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not an embed.</p></div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

}
