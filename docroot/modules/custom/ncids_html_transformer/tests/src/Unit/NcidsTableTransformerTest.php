<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsTableTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Table Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsTableTransformer
 */
class NcidsTableTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsTableTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsTableTransformer();
  }

  /**
   * Test transformation of very simple tables.
   *
   * @covers ::transform
   */
  public function simpleTableTest() {
    $input = <<<HEREDOC
      <table data-sortable class="table-default"></table>
      <table class="table-default complex-table"></table>
      <div class="test"><p>This is not a table.</p></div>
      <div class="chicken"><p>This is not a table.</p></div>
    HEREDOC;
    $expected_html = <<<HEREDOC
      <table data-sortable class="usa-table"></table>
      <table></table>
      <div class="test"><p>This is not a table.</p></div>
      <div class="chicken"><p>This is not a table.</p></div>
    HEREDOC;

    // Simulate full transformation process.
    $transformed = $this->transformer->transform($input);

    $this->assertEquals($expected_html, $transformed, 'Table without data-sortable attribute should not be transformed, while tables with the attribute should be.');
  }

  /**
   * Test a simple sortable table transformation.
   *
   * @covers ::transform
   */
  public function simpleSortableTableTest() {
    $input =
      '<table data-sortable class="default-table complex-table">' .
      '<thead><tr><th scope="col">Heading1</th><th scope="col">Heading2</th><th scope="col" data-fixed>HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td>Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';
    $expected_html =
      '<table data-sortable class="usa-table">' .
      '<thead><tr><th scope="col">Heading1</th><th scope="col">Heading2</th><th scope="col" data-fixed>HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td>Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';

    // Simulate full transformation process.
    $transformed = $this->transformer->transform($input);

    $this->assertEquals($expected_html, $transformed, 'Tables should be transformed and have the usa-table class');
  }

  /**
   * Test table transformation with attributes to be converted to styles.
   *
   * @covers ::transform
   */
  public function testConvertTableAttributesToStyles() {
    $input =
      '<table data-sortable class="default-table complex-table" border-width="1">' .
      '<thead><tr><th scope="col">Heading1</th><th height="25px" scope="col">Heading2</th><th scope="col" data-fixed>HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td width="100%">Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';
    $expected_html =
      '<table data-sortable class="usa-table" style="border-width: 1;">' .
      '<thead><tr><th scope="col">Heading1</th><th scope="col" style="height: 25px;">Heading2</th><th scope="col" data-fixed>HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td style="width: 100%;">Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';

    // Simulate full transformation process.
    $transformed = $this->transformer->transform($input);

    $this->assertEquals($expected_html, $transformed, 'Table should be transformed and appropriate attributes converted to styles');
  }

  /**
   * Test table transformation with bad attributes to be removed.
   *
   * Also tests a table with sortable attributes to update to ncids.
   *
   * @covers ::postProcessHtml
   */
  public function testConvertSortableTableWithBadAttributes() {
    $input =
      '<table data-sortable class="default-table complex-table" border-width="1">' .
      '<thead><tr><th data-sorted="up" scope="col">Heading1</th><th height="25px" scope="col">Heading2</th><th scope="col" data-fixed>HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td data-sorted="true" width="100%">Cell 1-1</td><td data-sorted="false">Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';
    $expected_html =
      '<table data-sortable class="usa-table" style="border-width: 1;">' .
      '<thead><tr><th scope="col" aria-sort="ascending">Heading1</th><th scope="col" style="height: 25px;">Heading2</th><th scope="col" data-fixed>HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td style="width: 100%;" data-sort-active>Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';

    // Simulate full transformation process.
    $transformed = $this->transformer->transform($input);

    $this->assertEquals($expected_html, $transformed, 'Table should be transformed and disallowed attributes removed or converted appropriately.');
  }

  /**
   * Test table transformation with bad border attribute to be converted.
   *
   * Should convert border="1" to style="border: 1px solid black;".
   *
   * @covers ::transform
   */
  public function testConvertTableWithBadBorderAttributes1() {
    $input =
      '<table border="1">' .
      '<thead><tr><th scope="col">Heading1</th><th scope="col">Heading2</th><th scope="col">HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td>Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';
    $expected_html =
      '<table style="border: 1px solid black;">' .
      '<thead><tr><th scope="col">Heading1</th><th scope="col">Heading2</th><th scope="col">HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td>Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';

    // Simulate full transformation process.
    $transformed = $this->transformer->transform($input);

    $this->assertEquals($expected_html, $transformed, 'Table should be transformed and disallowed attributes removed or converted appropriately.');
  }

  /**
   * Test table transformation with bad border attribute to be converted.
   *
   * Should remove border="0" since 0 would be no border.
   *
   * @covers ::transform
   */
  public function testConvertTableWithBadBorderAttributes0() {
    $input =
      '<table border="0">' .
      '<thead><tr><th scope="col">Heading1</th><th scope="col">Heading2</th><th scope="col">HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td>Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';
    $expected_html =
      '<table>' .
      '<thead><tr><th scope="col">Heading1</th><th scope="col">Heading2</th><th scope="col">HeadingFixed</th></tr></thead>' .
      '<tbody><tr><td>Cell 1-1</td><td>Cell 1-2</td><td>Cell 1-3</td></tr>' .
      '<tr><td>Cell 2-1</td><td>Cell 2-2</td><td>Cell 2-3</td></tr></tbody>' .
      '</table>';

    // Simulate full transformation process.
    $transformed = $this->transformer->transform($input);

    $this->assertEquals($expected_html, $transformed, 'Table should be transformed and disallowed attributes removed or converted appropriately.');
  }

}
