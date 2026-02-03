<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsDisallowedStylesTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Disallowed Styles Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsDisallowedStylesTransformer
 */
class NcidsDisallowedStylesTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsDisallowedStylesTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsDisallowedStylesTransformer();
  }

  /**
   * Tests an element handled by another transformer with invalid style.
   *
   * @covers ::transform
   */
  public function testOtherTransformerElementWithInvalidStyle(): void {
    $input = '<div class="callout-box" style="white-space: none;" data-html-transformer="NcidsCalloutBoxTransformer">Content</div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="callout-box" style="white-space: none;" data-html-transformer="NcidsCalloutBoxTransformer">Content</div>';
    $this->assertEquals($expected, $output, 'Should skip transformation for elements being handled by another transformer.');
  }

  /**
   * Tests nested invalid styles in element by another transformer.
   *
   * @covers ::transform
   */
  public function testNestedInvalidStylesOtherTransformer(): void {
    $input = '<div class="callout-box" data-html-transformer="NcidsCalloutBoxTransformer"><div style="color: blue;"><p>Text</p></div></div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="callout-box" data-html-transformer="NcidsCalloutBoxTransformer"><div style="color: blue;"><p>Text</p></div></div>';
    $this->assertEquals($expected, $output, 'Should NOT transform nested content within another transformer element.');
  }

  /**
   * Tests style removal from non-table elements and filtering of table styles.
   *
   * @covers ::transform
   */
  public function testStyleTransformation(): void {
    $input = '<div style="color: red; margin: 10px;">Container<span style="font-size: small; color: blue;">Text</span><table style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; color: red;"><td style="padding: 5px; font-size: large;">Cell Content</td></tr></table></div>';
    $output = $this->transformer->transform($input);
    $expected = '<div>Container<span>Text</span><table style="background-color: #fff;"><tr style="text-align: center;"><td style="padding: 5px;">Cell Content</td></tr></table></div>';
    $this->assertEquals($expected, $output, 'Should remove all bad styles from non-table elements and keep only allowed styles on table elements');
  }

  /**
   * Tests removal of width style when value is 100%.
   *
   * @covers ::transform
   */
  public function testTableStyleTransformationWithPercentWidth(): void {
    $input = '<table style="width: 100%; background-color: #fff; margin: 10px; invalid-prop: value;"><tr style="text-align: center; color: red;"><td style="padding: 5px; font-size: large;">Cell Content</td></tr></table>';
    $output = $this->transformer->transform($input);
    $expected = '<table style="background-color: #fff;"><tr style="text-align: center;"><td style="padding: 5px;">Cell Content</td></tr></table>';
    $this->assertEquals($expected, $output, 'Should remove invalid styles as well as width style when value is 100%');
  }

}
