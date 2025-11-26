<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsListTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids List Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsListTransformer
 */
class NcidsListTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsListTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsListTransformer();
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<ul class="no-bullets"><li>List item</li></ul>' .
      // This is following the original test, but I can't see in any
      // tickets what lists html should be, if this is supposed to be
      // a URL it should be fixed during implementation.
      '<div class="no-description">Description content</div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<ul class="no-bullets" data-html-transformer="NcidsListTransformer"><li>List item</li></ul>' .
      '<div class="no-description" data-html-transformer="NcidsListTransformer">Description content</div>' .
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
      '<ul class="no-bullets" data-html-transformer="NcidsListTransformer"><li>List item</li></ul>' .
      '<div class="no-description" data-html-transformer="NcidsListTransformer">Description content</div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<ul class="no-bullets"><li>List item</li></ul>' .
      '<div class="no-description">Description content</div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Tests no-bullets transformation - should NOT be transformed.
   *
   * @covers ::transform
   */
  public function testNoBulletsTransformation(): void {
    $input = '<ul class="no-bullets extra-class">List items</ul>';
    $output = $this->transformer->transform($input);
    $expected = '<ul class="no-bullets extra-class">List items</ul>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform no-bullets content');
  }

  /**
   * Tests no-description element - should NOT be transformed.
   *
   * @covers ::transform
   */
  public function testNoDescriptionPreservation(): void {
    $input = '<div class="no-description invalid-class">Description content</div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="no-description invalid-class">Description content</div>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform no-description content');
  }

}
