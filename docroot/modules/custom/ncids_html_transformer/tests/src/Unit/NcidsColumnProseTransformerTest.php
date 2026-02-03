<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsColumnProseTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Column Prose Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsColumnProseTransformer
 */
class NcidsColumnProseTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsColumnProseTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsColumnProseTransformer();
  }

  /**
   * Add usa-prose to simple grid-col div.
   *
   * @covers ::transform
   */
  public function testAddUsaProseToSimpleGridCol() {
    $original = '<div class="grid-col"><p>Content</p></div>';
    $expected = '<div class="grid-col usa-prose"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Add usa-prose to grid-col with number.
   *
   * @covers ::transform
   */
  public function testAddUsaProseToGridColWithNumber() {
    $original = '<div class="grid-col-6"><p>Content</p></div>';
    $expected = '<div class="grid-col-6 usa-prose"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Add usa-prose to responsive grid-col (tablet:grid-col).
   *
   * @covers ::transform
   */
  public function testAddUsaProseToResponsiveGridCol() {
    $original = '<div class="tablet:grid-col-6"><p>Content</p></div>';
    $expected = '<div class="tablet:grid-col-6 usa-prose"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Add usa-prose to desktop:grid-col variant.
   *
   * @covers ::transform
   */
  public function testAddUsaProseToDesktopGridCol() {
    $original = '<div class="desktop:grid-col-8"><p>Content</p></div>';
    $expected = '<div class="desktop:grid-col-8 usa-prose"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Add usa-prose to multiple column divs.
   *
   * @covers ::transform
   */
  public function testAddUsaProseToMultipleColumns() {
    $original = '<div class="grid-row"><div class="grid-col-6"><p>Left</p></div><div class="grid-col-6"><p>Right</p></div></div>';
    $expected = '<div class="grid-row"><div class="grid-col-6 usa-prose"><p>Left</p></div><div class="grid-col-6 usa-prose"><p>Right</p></div></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Don't duplicate usa-prose if already present.
   *
   * @covers ::transform
   */
  public function testDontDuplicateUsaProse() {
    $original = '<div class="grid-col-6 usa-prose"><p>Content</p></div>';
    $expected = '<div class="grid-col-6 usa-prose"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Add usa-prose while preserving other classes.
   *
   * @covers ::transform
   */
  public function testPreserveOtherClasses() {
    $original = '<div class="grid-col-6 custom-class"><p>Content</p></div>';
    $expected = '<div class="grid-col-6 custom-class usa-prose"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Handle grid-col-fill variant.
   *
   * @covers ::transform
   */
  public function testGridColFillVariant() {
    $original = '<div class="grid-col-fill"><p>Content</p></div>';
    $expected = '<div class="grid-col-fill usa-prose"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Add usa-prose to mobile responsive variant.
   *
   * @covers ::transform
   */
  public function testAddUsaProseToMobileGridCol() {
    $original = '<div class="mobile:grid-col-12 tablet:grid-col-6"><p>Content</p></div>';
    $expected = '<div class="mobile:grid-col-12 tablet:grid-col-6 usa-prose"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Don't modify non-column divs.
   *
   * @covers ::transform
   */
  public function testDontModifyNonColumnDivs() {
    $original = '<div class="grid-row"><p>Content</p></div>';
    $expected = '<div class="grid-row"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Add usa-prose to grid-col in nested structure.
   *
   * @covers ::transform
   */
  public function testAddUsaProseToNestedGridCol() {
    $original = '<div class="grid-container"><div class="grid-row"><div class="grid-col-6"><p>Column content</p></div></div></div>';
    $expected = '<div class="grid-container"><div class="grid-row"><div class="grid-col-6 usa-prose"><p>Column content</p></div></div></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

}
