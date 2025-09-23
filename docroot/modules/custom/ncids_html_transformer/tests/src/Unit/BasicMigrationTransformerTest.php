<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsDisallowedClassesTransformer;
use Drupal\ncids_html_transformer\Services\NcidsDisallowedStylesTransformer;
use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;
use Drupal\ncids_html_transformer\Services\NcidsTempCalloutBoxTransformer;
use Drupal\ncids_html_transformer\Services\NcidsTempListTransformer;
use Drupal\ncids_html_transformer\Services\NcidsTempPullquoteTransformer;
use Drupal\ncids_html_transformer\Services\NcidsTempTableTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Basic Migration Transformer Service.
 *
 * @group ncids_html_transformer
 */
class BasicMigrationTransformerTest extends UnitTestCase {

  /**
   * The transformer manager.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
   */
  protected $transformerManager;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    // Create the manager.
    $this->transformerManager = new NcidsHtmlTransformerManager();

    // Add our transformers.
    $pullquoteTransformer = new NcidsTempPullquoteTransformer();
    $tableTransformer = new NcidsTempTableTransformer();
    $listTransformer = new NcidsTempListTransformer();
    $calloutBoxTransformer = new NcidsTempCalloutBoxTransformer();
    $classTransformer = new NcidsDisallowedClassesTransformer();
    $styleTransformer = new NcidsDisallowedStylesTransformer();

    // Add them to the manager.
    $this->transformerManager->addTransformer($pullquoteTransformer, 'pull_quote_preprocess');
    $this->transformerManager->addTransformer($tableTransformer, 'table_preprocess');
    $this->transformerManager->addTransformer($listTransformer, 'list_preprocess');
    $this->transformerManager->addTransformer($calloutBoxTransformer, 'callout_box_preprocess');
    $this->transformerManager->addTransformer($classTransformer, 'remove_classes');
    $this->transformerManager->addTransformer($styleTransformer, 'remove_styles');
  }

  /**
   * Tests a simple callout box with invalid class - should NOT be transformed.
   *
   * @Covers::transform
   */
  public function testCalloutBoxWithInvalidClass(): void {
    $input = '<div class="callout-box invalid-class">Content</div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="callout-box invalid-class" data-html-transformer="callout-box">Content</div>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform callout-box content');
  }

  /**
   * Tests nested invalid classes with preserved structure - callout-box.
   *
   * @Covers::transform
   */
  public function testNestedInvalidClasses(): void {
    $input = '<div class="callout-box"><div class="invalid1"><p class="invalid2">Text</p></div></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="callout-box" data-html-transformer="callout-box"><div class="invalid1"><p class="invalid2">Text</p></div></div>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform nested content within callout-box');
  }

  /**
   * Tests no-bullets transformation - should NOT be transformed.
   *
   * @Covers::transform
   */
  public function testNoBulletsTransformation(): void {
    $input = '<ul class="no-bullets extra-class">List items</ul>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<ul class="no-bullets extra-class" data-html-transformer="no-bullets">List items</ul>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform no-bullets content');
  }

  /**
   * Tests complex table with allowed styles - should NOT be transformed.
   *
   * @Covers::transform
   */
  public function testTableWithAllowedStyles(): void {
    $input = '<table class="complex-table" style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; invalid: prop;"><td>Content</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table class="complex-table" style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;" data-html-transformer="table"><tr style="text-align: center; invalid: prop;"><td>Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform complex-table content');
  }

  /**
   * Tests summary box component structure - should be transformed.
   *
   * @Covers::transform
   */
  public function testSummaryBoxStructure(): void {
    $input = '<div class="usa-summary-box invalid-class"><h3 class="usa-summary-box__heading wrong-class">Title</h3><div class="usa-summary-box__text invalid">Content</div></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="usa-summary-box"><h3 class="usa-summary-box__heading">Title</h3><div class="usa-summary-box__text">Content</div></div>';
    $this->assertEquals($expected, $output, 'Should preserve summary box structure and remove invalid classes (no data tag added)');
  }

  /**
   * Tests grid system classes - should be transformed (no special class).
   *
   * @Covers::transform
   */
  public function testGridSystemClasses(): void {
    $input = '<div class="grid-container invalid"><div class="grid-row wrong-class"><div class="grid-col-6 tablet:grid-col-4 invalid">Content</div></div></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="grid-container"><div class="grid-row"><div class="grid-col-6 tablet:grid-col-4">Content</div></div></div>';
    $this->assertEquals($expected, $output, 'Should preserve grid system classes and remove invalid ones (no data tag added)');
  }

  /**
   * Tests button classes with combinations - should be transformed.
   *
   * @Covers::transform
   */
  public function testButtonClassCombinations(): void {
    $input = '<a class="usa-button usa-button--outline invalid-class extra">Click me</a>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<a class="usa-button usa-button--outline">Click me</a>';
    $this->assertEquals($expected, $output, 'Should preserve allowed button class combinations and remove others (no data tag added)');
  }

  /**
   * Tests callout box variations - should be transformed (no special class).
   *
   * @Covers::transform
   */
  public function testCalloutBoxVariations(): void {
    $input = '<div class="callout-box-center invalid"><aside class="callout-box-right wrong">Right Box</aside></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="callout-box-center invalid" data-html-transformer="callout-box-center"><aside class="callout-box-right wrong" data-html-transformer="callout-box-right">Right Box</aside></div>';
    $this->assertEquals($expected, $output, 'Should preserve allowed callout box variations and remove invalid classes (no data tag added)');
  }

  /**
   * Tests mixed content with text nodes - callout-box.
   *
   * @Covers::transform
   */
  public function testMixedContentWithTextNodes(): void {
    $input = '<div class="callout-box">Text <span class="invalid">More</span> <p class="wrong">Text</p></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="callout-box" data-html-transformer="callout-box">Text <span class="invalid">More</span> <p class="wrong">Text</p></div>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform callout-box content, preserving all child elements');
  }

  /**
   * Tests table cell alignment classes - should be transformed.
   *
   * @Covers::transform
   */
  public function testTableCellAlignment(): void {
    $input = '<table class="table-default"><tr><td class="text-left invalid">Content</td><td class="wrong text-left">More</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table class="table-default" data-html-transformer="table"><tr><td class="text-left invalid">Content</td><td class="wrong text-left">More</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should skip over table cells but add data tag to table element');
  }

  /**
   * Tests complex nested structure with multiple elements - complex-table.
   *
   * @Covers::transform
   */
  public function testComplexNestedStructure(): void {
    $input = '<div class="grid-container invalid"><div class="grid-row wrong"><div class="grid-col-6 bad"><table class="complex-table invalid"><tr class="wrong"><td class="text-left bad" style="text-align: center; invalid: prop;">Content</td></tr></table></div></div></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="grid-container"><div class="grid-row"><div class="grid-col-6"><table class="complex-table invalid" data-html-transformer="table"><tr class="wrong"><td class="text-left bad" style="text-align: center; invalid: prop;">Content</td></tr></table></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform outer elements but preserve complex-table and its children with data tag');
  }

  /**
   * Tests pullquote element - should NOT be transformed.
   */
  public function testPullquotePreservation(): void {
    $input = '<blockquote class="pullquote invalid-class">Quote content</blockquote>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<blockquote class="pullquote invalid-class" data-html-transformer="pullquote">Quote content</blockquote>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform pullquote content');
  }

  /**
   * Tests no-description element - should NOT be transformed.
   */
  public function testNoDescriptionPreservation(): void {
    $input = '<div class="no-description invalid-class">Description content</div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="no-description invalid-class" data-html-transformer="no-description">Description content</div>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform no-description content');
  }

  /**
   * Tests style removal from non-table elements and filtering of table styles.
   *
   * @Covers::transform
   */
  public function testStyleTransformation(): void {
    $input = '<div style="color: red; margin: 10px;">Container<span style="font-size: small; color: blue;">Text</span><table style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; color: red;"><td style="padding: 5px; font-size: large;">Cell Content</td></tr></table></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div>Container<span>Text</span><table style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;" data-html-transformer="table"><tr style="text-align: center; color: red;"><td style="padding: 5px; font-size: large;">Cell Content</td></tr></table></div>';
    $this->assertEquals($expected, $output, 'Should remove all styles from non-table elements and keep only allowed styles on table elements');
  }

  /**
   * Tests complete style removal when table elements have no allowed styles.
   *
   * @Covers::transform
   */
  public function testTableStyleCompleteRemoval(): void {
    $input = '<table style="color: red; margin: 10px; font-size: large;"><tbody style="display: block;"><tr style="cursor: pointer;"><th style="color: blue;">Header</th><td style="font-family: Arial;">Data</td></tr></tbody></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table style="color: red; margin: 10px; font-size: large;" data-html-transformer="table"><tbody style="display: block;"><tr style="cursor: pointer;"><th style="color: blue;">Header</th><td style="font-family: Arial;">Data</td></tr></tbody></table>';
    $this->assertEquals($expected, $output, 'Should remove style attributes entirely from table elements when no allowed styles are present');
  }

  /**
   * Tests mixed allowed and disallowed styles on table elements.
   *
   * @Covers::transform
   */
  public function testTableMixedStyles(): void {
    $input = '<table style="width: 100%; color: red; border: 1px solid black; font-size: 12px;"><tr style="height: 50px; background-color: #f0f0f0; display: flex;"><td style="text-align: left; color: blue; padding: 10px; margin: 5px;">Content</td></tr></table>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<table style="width: 100%; color: red; border: 1px solid black; font-size: 12px;" data-html-transformer="table"><tr style="height: 50px; background-color: #f0f0f0; display: flex;"><td style="text-align: left; color: blue; padding: 10px; margin: 5px;">Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should preserve only allowed styles on table elements and remove disallowed ones');
  }

}
