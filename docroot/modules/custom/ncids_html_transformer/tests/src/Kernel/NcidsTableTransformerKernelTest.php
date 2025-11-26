<?php

namespace Drupal\Tests\ncids_html_transformer\Kernel;

/**
 * Kernel tests for the Table Transformer service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
 */
class NcidsTableTransformerKernelTest extends NcidsTransformerKernelTestBase {

  /**
   * Ensures all tagged transformers run via the service collector.
   *
   * NOTE: Kernel tests must bootstrap a portion of the system and thus are
   * slower than unit tests. So we only want 1 test method here and call
   * helper methods (not named test*) for each of the test cases. This way
   * the test method will stay organized. We will name these helper methods
   * with a "check" prefix to indicate they are test helpers.
   *
   * (FYI, PHPUnit runs all methods starting with "test" as test cases and
   * some rules in newer Drupal require that Kernel tests only have one test
   * method. So that is why we can't name these helper methods with "test".)
   *
   * @covers ::transformAll
   */
  public function testTransformers(): void {
    $this->checkTableWithAllowedStyles();
    $this->checkTableCellAlignment();
    $this->checkComplexNestedStructure();
    $this->checkTableStyleCompleteRemoval();
    $this->checkTableMixedStyles();
  }

  /**
   * Tests complex table with allowed styles - should NOT be transformed.
   */
  public function checkTableWithAllowedStyles(): void {
    $input = '<table class="complex-table" style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; invalid: prop;"><td>Content</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table class="complex-table" style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; invalid: prop;"><td>Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform complex-table content');
  }

  /**
   * Tests table cell alignment classes - should be transformed.
   *
   * @Covers::transform
   */
  public function checkTableCellAlignment(): void {
    $input = '<table class="table-default"><tr><td class="text-left invalid">Content</td><td class="wrong text-left">More</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table class="table-default"><tr><td class="text-left invalid">Content</td><td class="wrong text-left">More</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should skip over table cells but add data tag to table element');
  }

  /**
   * Tests complex nested structure with multiple elements - complex-table.
   */
  public function checkComplexNestedStructure(): void {
    $input = '<div class="grid-container invalid"><div class="grid-row wrong"><div class="grid-col-6 bad"><table class="complex-table invalid"><tr class="wrong"><td class="text-left bad" style="text-align: center; invalid: prop;">Content</td></tr></table></div></div></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="grid-container"><div class="grid-row"><div class="grid-col-6"><table class="complex-table invalid"><tr class="wrong"><td class="text-left bad" style="text-align: center; invalid: prop;">Content</td></tr></table></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform outer elements but preserve complex-table and its children with data tag');
  }

  /**
   * Tests complete style removal when table elements have no allowed styles.
   */
  public function checkTableStyleCompleteRemoval(): void {
    $input = '<table style="color: red; margin: 10px; font-size: large;"><tbody style="display: block;"><tr style="cursor: pointer;"><th style="color: blue;">Header</th><td style="font-family: Arial;">Data</td></tr></tbody></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table style="color: red; margin: 10px; font-size: large;"><tbody style="display: block;"><tr style="cursor: pointer;"><th style="color: blue;">Header</th><td style="font-family: Arial;">Data</td></tr></tbody></table>';
    $this->assertEquals($expected, $output, 'Should remove style attributes entirely from table elements when no allowed styles are present');
  }

  /**
   * Tests mixed allowed and disallowed styles on table elements.
   */
  public function checkTableMixedStyles(): void {
    $input = '<table style="width: 100%; color: red; border: 1px solid black; font-size: 12px;"><tr style="height: 50px; background-color: #f0f0f0; display: flex;"><td style="text-align: left; color: blue; padding: 10px; margin: 5px;">Content</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table style="width: 100%; color: red; border: 1px solid black; font-size: 12px;"><tr style="height: 50px; background-color: #f0f0f0; display: flex;"><td style="text-align: left; color: blue; padding: 10px; margin: 5px;">Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should preserve only allowed styles on table elements and remove disallowed ones');
  }

}
