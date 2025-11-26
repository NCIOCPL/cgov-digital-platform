<?php

namespace Drupal\Tests\ncids_html_transformer\Kernel;

/**
 * Kernel tests for the NCIDS HTML transformer manager service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
 */
class NcidsCalloutBoxTransformerKernelTest extends NcidsTransformerKernelTestBase {

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
    $this->checkNestedInvalidClasses();
    $this->checkCalloutBoxVariations();
    $this->checkMixedContentWithTextNodes();
  }

  /**
   * Tests nested invalid classes with preserved structure - callout-box.
   */
  public function checkNestedInvalidClasses(): void {
    $input = '<div class="callout-box"><div class="invalid1"><p class="invalid2">Text</p></div></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="callout-box"><div class="invalid1"><p class="invalid2">Text</p></div></div>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform nested content within callout-box');
  }

  /**
   * Tests callout box variations - should be transformed (no special class).
   */
  public function checkCalloutBoxVariations(): void {
    $input = '<div class="callout-box-center invalid"><aside class="callout-box-right wrong">Right Box</aside></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="callout-box-center invalid"><aside class="callout-box-right wrong">Right Box</aside></div>';
    $this->assertEquals($expected, $output, 'Should preserve allowed callout box variations and remove invalid classes (no data tag added)');
  }

  /**
   * Tests mixed content with text nodes - callout-box.
   */
  public function checkMixedContentWithTextNodes(): void {
    $input = '<div class="callout-box">Text <span class="invalid">More</span> <p class="wrong">Text</p></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="callout-box">Text <span class="invalid">More</span> <p class="wrong">Text</p></div>';
    $this->assertEquals($expected, $output, 'Should add data tag and NOT transform callout-box content, preserving all child elements');
  }

}
