<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;
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
   * The transformer manager.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
   */
  protected $transfomerManager;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transfomerManager = new NcidsHtmlTransformerManager();
    $this->transformer = new NcidsTableTransformer($this->transfomerManager);
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<table class="complex-table"></table>' .
      '<table class="default-table"></table>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<table class="complex-table" data-html-transformer="NcidsTableTransformer"></table>' .
      '<table class="default-table" data-html-transformer="NcidsTableTransformer"></table>' .
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
      '<table class="complex-table" data-html-transformer="NcidsTableTransformer"></table>' .
      '<table class="default-table" data-html-transformer="NcidsTableTransformer"></table>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<table class="complex-table"></table>' .
      '<table class="default-table"></table>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Test postProcessHtml method.
   *
   * @covers ::postProcessHtml
   */
  public function testSimpleIntegrationTest() {
    $input =
      '<table class="default-table"></table>' .
      '<table class="default-table complex-table"></table>' .
      '<div class="test"><p>This is not a table.</p></div>' .
      '<div class="chicken"><p>This is not a table.</p></div>';
    $expected_html =
      '<table class="usa-table"></table>' .
      '<table data-sortable class="usa-table"></table>' .
      '<div class="test"><p>This is not a table.</p></div>' .
      '<div class="chicken"><p>This is not a table.</p></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);

    $this->assertEquals($expected_html, $post_processed, 'Table should be transformed and have the usa-table class');
  }

  /**
   * Test postProcessHtml method.
   *
   * @covers ::postProcessHtml
   */
  public function testSortableTable1() {
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
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);

    $this->assertEquals($expected_html, $post_processed, 'Table should be transformed and have the usa-table class');
  }

  /* Tests removed from BasicMigrationTransformerTest.php to be implemented.
   *
   * - Tests complex table with allowed styles - should NOT be transformed.
   * https://github.com/NCIOCPL/cgov-digital-platform/blob/f29676a597f2ed735e87959d8653a10da25a2f5c/docroot/modules/custom/ncids_html_transformer/tests/src/Unit/BasicMigrationTransformerTest.php#L95
   * - Tests table cell alignment classes - should be transformed.
   * https://github.com/NCIOCPL/cgov-digital-platform/blob/f29676a597f2ed735e87959d8653a10da25a2f5c/docroot/modules/custom/ncids_html_transformer/tests/src/Unit/BasicMigrationTransformerTest.php#L167
   * - Tests complex nested structure with multiple elements - complex-table.
   * https://github.com/NCIOCPL/cgov-digital-platform/blob/f29676a597f2ed735e87959d8653a10da25a2f5c/docroot/modules/custom/ncids_html_transformer/tests/src/Unit/BasicMigrationTransformerTest.php#L179
   * - Tests complete style removal when table elements have no allowed styles.
   * https://github.com/NCIOCPL/cgov-digital-platform/blob/f29676a597f2ed735e87959d8653a10da25a2f5c/docroot/modules/custom/ncids_html_transformer/tests/src/Unit/BasicMigrationTransformerTest.php#L223
   * - Tests mixed allowed and disallowed styles on table elements.
   *https://github.com/NCIOCPL/cgov-digital-platform/blob/f29676a597f2ed735e87959d8653a10da25a2f5c/docroot/modules/custom/ncids_html_transformer/tests/src/Unit/BasicMigrationTransformerTest.php#L235
   */
}
