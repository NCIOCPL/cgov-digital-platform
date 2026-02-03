<?php

namespace Drupal\Tests\ncids_html_transformer\Kernel;

use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;

/**
 * Kernel tests for the NCIDS HTML transformer manager service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
 */
class NcidsHtmlTransformerManagerKernelTest extends NcidsTransformerKernelTestBase {

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
    // Overall test that the manager service is working.
    $this->assertInstanceOf(NcidsHtmlTransformerManager::class, $this->transformerManager);

    $this->checkMixOfClassesStylesAndAttributes();
    $this->checkMixOfClassesStylesAndAttributesWithDefinition();
  }

  /**
   * Tests mix of classes, styles, and attributes on various elements.
   */
  private function checkMixOfClassesStylesAndAttributes(): void {
    $input = '<div id="test-div" class="invalid" style="width: 100%;" data-custom="remove">Content <span class="invalid" style="width: 100%;" id="inner-span">Text</span> <p id="paragraph" class="invalid" style="width: 100%;" onclick="alert()">Para</p></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div id="test-div">Content <span id="inner-span">Text</span> <p id="paragraph">Para</p></div>';
    $this->assertEquals($expected, $output, 'Should preserve ID attributes on all elements while removing other disallowed attributes');
  }

  /**
   * Tests mix of classes, styles, and attributes on various elements.
   */
  private function checkMixOfClassesStylesAndAttributesWithDefinition(): void {
    $input = '<div id="test-div" class="invalid" style="width: 100%;" data-custom="remove">Content <span class="invalid" style="width: 100%;" id="inner-span">Text</span> <a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a> <p id="paragraph" class="invalid" style="width: 100%;" onclick="alert()">Para</p></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div id="test-div">Content <span id="inner-span">Text</span> <nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition> <p id="paragraph">Para</p></div>';
    $this->assertEquals($expected, $output, 'Should preserve ID attributes on all elements while removing other disallowed attributes');
  }

  /* Bad tests:
   * Tests summary box component structure - should be transformed.
   */
}
