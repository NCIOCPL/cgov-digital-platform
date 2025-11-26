<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsCalloutBoxTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Callout Box Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsCalloutBoxTransformer
 */
class NcidsCalloutBoxTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsCalloutBoxTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsCalloutBoxTransformer();
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<div class="callout-box"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-left"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-right"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-center"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-full"><p>This is an info callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<div class="callout-box" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-left" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-right" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-center" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-full" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
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
      '<div class="callout-box" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-left" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-right" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-center" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-full" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<div class="callout-box"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-left"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-right"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-center"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-full"><p>This is an info callout box.</p></div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Integration-like test for pre/post transformation process.
   *
   * @covers ::preProcessHtml
   * @covers ::transform
   * @covers ::postProcessHtml
   */
  public function testSimpleIntegrationTest() {
    $input = '<div class="callout-box"><p>This is an info callout box.</p></div>';
    $expected = '<div class="callout-box"><p>This is an info callout box.</p></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);

    $this->assertEquals($expected, $post_processed, 'Callout box should be preserved through full transformation process.');
  }

  /* Tests removed from BasicMigrationTransformerTest.php to be implemented.
   *
   * - Tests callout box variations - should be transformed (no special class).
   * https://github.com/NCIOCPL/cgov-digital-platform/blob/f29676a597f2ed735e87959d8653a10da25a2f5c/docroot/modules/custom/ncids_html_transformer/tests/src/Unit/BasicMigrationTransformerTest.php#L139
   * - Tests mixed content with text nodes - callout-box.
   * https://github.com/NCIOCPL/cgov-digital-platform/blob/f29676a597f2ed735e87959d8653a10da25a2f5c/docroot/modules/custom/ncids_html_transformer/tests/src/Unit/BasicMigrationTransformerTest.php#L139
   *
   */

}
