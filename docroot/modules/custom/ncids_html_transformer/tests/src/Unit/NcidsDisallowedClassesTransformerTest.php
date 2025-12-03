<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsDisallowedClassesTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Disallowed Classes Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsDisallowedClassesTransformer
 */
class NcidsDisallowedClassesTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsDisallowedClassesTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsDisallowedClassesTransformer();
  }

  /**
   * Tests an element handled by another transformer with invalid class.
   *
   * @covers ::transform
   */
  public function testOtherTransformerElementWithInvalidClass(): void {
    $input = '<div class="callout-box invalid-class" data-html-transformer="NcidsCalloutBoxTransformer">Content</div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="callout-box invalid-class" data-html-transformer="NcidsCalloutBoxTransformer">Content</div>';
    $this->assertEquals($expected, $output, 'Should skip transformation for elements being handled by another transformer.');
  }

  /**
   * Tests nested invalid classes in element by another transformer.
   *
   * @covers ::transform
   */
  public function testNestedInvalidClassesOtherTransformer(): void {
    $input = '<div class="callout-box" data-html-transformer="NcidsCalloutBoxTransformer"><div class="invalid1"><p class="invalid2">Text</p></div></div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="callout-box" data-html-transformer="NcidsCalloutBoxTransformer"><div class="invalid1"><p class="invalid2">Text</p></div></div>';
    $this->assertEquals($expected, $output, 'Should NOT transform nested content within another transformer element.');
  }

  /**
   * Tests no-bullets transformation.
   *
   * @covers ::transform
   */
  public function testNoBulletsTransformation(): void {
    $input = '<ul class="no-bullets no-description"><li>List items</li></ul>';
    $output = $this->transformer->transform($input);
    $expected = '<ul><li>List items</li></ul>';
    $this->assertEquals($expected, $output, 'Should remove no-bullets and no-description classes');
  }

  /* ------------------- Tests for NCIDS elements ------------------- */

  /**
   * Tests cleaning summary box (as existing html) component structure.
   *
   * This is not meant to run after the callout transformer, but ensure that
   * any existing content with new usa-summary-box structure is preserved while
   * cleaning invalid classes.
   *
   * @covers ::transform
   */
  public function testSummaryBoxStructure(): void {
    $input = '<div class="usa-summary-box invalid-class"><div class="usa-summary-box__heading wrong-class">Title</div><div class="usa-summary-box__text invalid">Content</div></div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="usa-summary-box"><div class="usa-summary-box__heading">Title</div><div class="usa-summary-box__text">Content</div></div>';
    $this->assertEquals($expected, $output, 'Should preserve summary box structure and remove invalid classes (no data tag added)');
  }

  /**
   * Tests button classes with combinations - should be transformed.
   *
   * @covers ::transform
   */
  public function testButtonClassCombinations(): void {
    $input = '<a class="usa-button usa-button--outline invalid-class extra">Click me</a>';
    $output = $this->transformer->transform($input);
    $expected = '<a class="usa-button usa-button--outline">Click me</a>';
    $this->assertEquals($expected, $output, 'Should preserve allowed button class combinations and remove others (no data tag added)');
  }

  /**
   * Tests grid system classes - should be transformed (no special class).
   *
   * @covers ::transform
   */
  public function testGridSystemClasses(): void {
    $input = '<div class="grid-container invalid"><div class="grid-row wrong-class"><div class="grid-col-6 tablet:grid-col-4 invalid">Content</div></div></div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="grid-container"><div class="grid-row"><div class="grid-col-6 tablet:grid-col-4">Content</div></div></div>';
    $this->assertEquals($expected, $output, 'Should preserve grid system classes and remove invalid ones (no data tag added)');
  }

  /**
   * Tests mixed allowed and disallowed styles on table elements.
   *
   * @Covers::transform
   */
  public function testGridColFill(): void {
    $input = '<div class="tablet:grid-col-fill invalid-class">content</div>';
    $output = $this->transformer->transform($input);
    $expected = '<div class="tablet:grid-col-fill">content</div>';
    $this->assertEquals($expected, $output, 'Should preserve tablet:grid-col-fill and remove invalid classes');
  }

}
