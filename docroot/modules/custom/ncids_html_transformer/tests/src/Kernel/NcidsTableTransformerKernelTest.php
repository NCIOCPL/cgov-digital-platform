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
    $this->checkTableWithDisallowedClasses();
    $this->checkNestedTablesForTransformation();
    $this->checkTableStyleCompleteRemoval();
    $this->checkTableMixedStyles();
  }

  /**
   * Tests basic table with allowed/disallowed styles.
   *
   * Should retain allowed styles and remove those disallowed.
   */
  public function checkTableWithAllowedStyles(): void {
    $input = '<table style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; invalid: prop;"><td>Content</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table style="background-color: #fff;"><tr style="text-align: center;"><td>Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should retain allowed styles and remove those disallowed.');
  }

  /**
   * Tests basic table with disallowed classes.
   *
   * Should remove invalid classes from all table elements/children.
   */
  public function checkTableWithDisallowedClasses(): void {
    $input = '<table class="table-default"><tr><td class="text-left invalid">Content</td><td class="wrong text-left">More</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table><tr><td>Content</td><td>More</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should remove invalid classes from all table elements/children.');
  }

  /**
   * Tests nested table with multiple table elements.
   *
   * Should transform outer elements as well as all tables.
   */
  public function checkNestedTablesForTransformation(): void {
    $input = '<div class="grid-container invalid"><div class="grid-row wrong"><div class="grid-col-6 bad"><table class="complex-table invalid"><tr class="wrong"><td class="text-left bad" style="text-align: center; invalid: prop;"><table class="complex-table invalid"><tr class="wrong"><td class="text-left bad" style="text-align: center; invalid: prop;">Content</td></tr></table></td></tr></table></div></div></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="grid-container"><div class="grid-row"><div class="grid-col-6 usa-prose"><table><tr><td style="text-align: center;"><table><tr><td style="text-align: center;">Content</td></tr></table></td></tr></table></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform outer elements as well as all tables, included nested tables.');
  }

  /**
   * Tests complete table transformation of a sortable table.
   *
   * Should fully transform the table included disallowed attributes and styles.
   */
  public function checkTableStyleCompleteRemoval(): void {
    $input = '<table data-sortable class="table-default complex-table" style="color: red; margin: 10px; font-size: large;"><tbody style="display: block;"><tr style="cursor: pointer;"><th style="color: blue;">Header</th><td style="font-family: Arial;">Data</td></tr></tbody></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table data-sortable class="usa-table"><tbody><tr><th>Header</th><td>Data</td></tr></tbody></table>';
    $this->assertEquals($expected, $output, 'Should fully transform the table included disallowed attributes and styles.');
  }

  /**
   * Tests mixed allowed and disallowed styles on table elements.
   */
  public function checkTableMixedStyles(): void {
    $input = '<table style="width: 100%; color: red; border: 1px solid black; font-size: 12px;"><tr style="height: 50px; background-color: #f0f0f0; display: flex;"><td style="text-align: left; color: blue; padding: 10px; margin: 5px;">Content</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table style="border: 1px solid black;"><tr style="height: 50px; background-color: #f0f0f0;"><td style="text-align: left; padding: 10px;">Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should preserve only allowed styles on table elements and remove disallowed ones');
  }

  /**
   * Tests removal of width attribute when value is 100%.
   *
   * @covers ::transform
   */
  public function testTableStyleTransformationWithPercentWidthAttribute(): void {
    $input = '<table width="100%" style="background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; color: red;"><td style="padding: 5px; font-size: large;">Cell Content</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table style="background-color: #fff;"><tr style="text-align: center;"><td style="padding: 5px;">Cell Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should remove all bad styles from non-table elements and keep only allowed styles on table elements');
  }

  /**
   * Tests removal of width style when value is 100%.
   *
   * @covers ::transform
   */
  public function testTableStyleTransformationWithPercentWidthStyle(): void {
    $input = '<table style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; color: red;"><td style="padding: 5px; font-size: large;">Cell Content</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table style="background-color: #fff;"><tr style="text-align: center;"><td style="padding: 5px;">Cell Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should remove all bad styles from non-table elements and keep only allowed styles on table elements');
  }

}
