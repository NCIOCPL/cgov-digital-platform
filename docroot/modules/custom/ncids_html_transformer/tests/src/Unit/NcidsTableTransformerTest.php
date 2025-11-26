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
