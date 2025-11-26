<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsPullquoteTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Pullquote Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsPullquoteTransformer
 */
class NcidsPullquoteTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsPullquoteTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsPullquoteTransformer();
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<div class="pullquote">Quote content</div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<div class="pullquote" data-html-transformer="NcidsPullquoteTransformer">Quote content</div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';

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
      '<div class="pullquote" data-html-transformer="NcidsPullquoteTransformer">Quote content</div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<div class="pullquote">Quote content</div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Tests pullquote element.
   *
   * @covers ::transform
   */
  public function testPullquotePreservation(): void {
    $input = '<blockquote class="pullquote invalid-class">Quote content</blockquote>';
    $output = $this->transformer->transform($input);
    $expected = '<blockquote class="pullquote invalid-class">Quote content</blockquote>';
    $this->assertEquals($expected, $output, 'Should transform pullquote content');
  }

}
