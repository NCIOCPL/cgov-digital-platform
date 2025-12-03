<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsIgnoreTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Pullquote Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsIgnoreTransformer
 */
class NcidsIgnoreTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsIgnoreTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsIgnoreTransformer();
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<div class="cgdp-embed-media-wrapper">Chicken</div>';
    $expected_html =
      '<div class="cgdp-embed-media-wrapper" data-html-transformer="NcidsIgnoreTransformer">Chicken</div>';

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
      '<div class="cgdp-embed-media-wrapper" data-html-transformer="NcidsIgnoreTransformer">Chicken</div>';
    $expected_html =
      '<div class="cgdp-embed-media-wrapper">Chicken</div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Tests ignore transformer element.
   *
   * @covers ::transform
   */
  public function testIgnoreTransformerPreservation(): void {
    $input = '<div class="cgdp-embed-media-wrapper">Chicken</div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="cgdp-embed-media-wrapper">Chicken</div>';
    $this->assertEquals($expected, $output, 'Should preserve ignore transformer content');
  }

}
