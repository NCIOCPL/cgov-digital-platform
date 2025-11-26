<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerInterface;
use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Html Transformer Manager Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
 */
class NcidsHtmlTransformerManagerTest extends UnitTestCase {

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

    // Create mock transformer 1.
    $mockTransformer1 = $this->createMock(NcidsHtmlTransformerInterface::class);
    $mockTransformer1->method('transform')
      ->willReturnCallback(function ($html) {
        return $html;
      });
    $mockTransformer1->method('preProcessHtml')
      ->willReturnCallback(function ($html) {
        return $html;
      });
    $mockTransformer1->method('postProcessHtml')
      ->willReturnCallback(function ($html) {
        return $html;
      });

    // Create mock transformer 2.
    $mockTransformer2 = $this->createMock(NcidsHtmlTransformerInterface::class);
    $mockTransformer2->method('transform')
      ->willReturnCallback(function ($html) {
        return $html;
      });
    $mockTransformer2->method('preProcessHtml')
      ->willReturnCallback(function ($html) {
        return $html;
      });
    $mockTransformer2->method('postProcessHtml')
      ->willReturnCallback(function ($html) {
        return $html;
      });

    // Add them to the manager.
    $this->transformerManager->addTransformer($mockTransformer1, 'mock_transformer_1');
    $this->transformerManager->addTransformer($mockTransformer2, 'mock_transformer_2');
  }

  /**
   * Tests that transformAll calls methods in the correct order.
   *
   * The expected order is:
   * 1. All preProcessHtml methods for all transformers
   * 2. All transform methods for all transformers
   * 3. All postProcessHtml methods for all transformers.
   *
   * @covers ::transformAll
   */
  public function testTransformAllCallsMethodsInCorrectOrder(): void {
    $callOrder = [];

    // Create a new manager for this test with fresh mocks.
    $manager = new NcidsHtmlTransformerManager();

    // Create mock transformer 1 with call tracking.
    $mockTransformer1 = $this->createMock(NcidsHtmlTransformerInterface::class);
    $mockTransformer1->method('preProcessHtml')
      ->willReturnCallback(function ($html) use (&$callOrder) {
        $callOrder[] = 'transformer1_preProcess';
        return $html;
      });
    $mockTransformer1->method('transform')
      ->willReturnCallback(function ($html) use (&$callOrder) {
        $callOrder[] = 'transformer1_transform';
        return $html;
      });
    $mockTransformer1->method('postProcessHtml')
      ->willReturnCallback(function ($html) use (&$callOrder) {
        $callOrder[] = 'transformer1_postProcess';
        return $html;
      });

    // Create mock transformer 2 with call tracking.
    $mockTransformer2 = $this->createMock(NcidsHtmlTransformerInterface::class);
    $mockTransformer2->method('preProcessHtml')
      ->willReturnCallback(function ($html) use (&$callOrder) {
        $callOrder[] = 'transformer2_preProcess';
        return $html;
      });
    $mockTransformer2->method('transform')
      ->willReturnCallback(function ($html) use (&$callOrder) {
        $callOrder[] = 'transformer2_transform';
        return $html;
      });
    $mockTransformer2->method('postProcessHtml')
      ->willReturnCallback(function ($html) use (&$callOrder) {
        $callOrder[] = 'transformer2_postProcess';
        return $html;
      });

    // Add transformers to the manager.
    $manager->addTransformer($mockTransformer1, 'transformer1');
    $manager->addTransformer($mockTransformer2, 'transformer2');

    // Call transformAll with some HTML.
    $html = '<p>Test content</p>';
    $manager->transformAll($html);

    // Verify the call order.
    $expectedOrder = [
      'transformer1_preProcess',
      'transformer2_preProcess',
      'transformer1_transform',
      'transformer2_transform',
      'transformer1_postProcess',
      'transformer2_postProcess',
    ];

    $this->assertEquals($expectedOrder, $callOrder, 'Methods should be called in the correct order: all preProcess, then all transform, then all postProcess');
  }

  /**
   * Tests transformAll with empty string input.
   *
   * @covers ::transformAll
   */
  public function testTransformAllWithEmptyString(): void {
    $output = $this->transformerManager->transformAll('');
    $this->assertEquals('', $output, 'Should return empty string when input is empty string');
  }

  /**
   * Tests transformAll with only multiple spaces.
   *
   * @covers ::transformAll
   */
  public function testTransformAllWithMultipleSpaces(): void {
    $output1 = $this->transformerManager->transformAll('   ');

    $this->assertEquals('   ', $output1, 'Should return spaces when input is only spaces');
  }

}
