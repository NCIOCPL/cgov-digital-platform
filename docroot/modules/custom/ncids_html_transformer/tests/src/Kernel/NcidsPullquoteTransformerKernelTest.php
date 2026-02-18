<?php

namespace Drupal\Tests\ncids_html_transformer\Kernel;

/**
 * Kernel tests for the NCIDS HTML transformer manager service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
 */
class NcidsPullquoteTransformerKernelTest extends NcidsTransformerKernelTestBase {

  /**
   * Tests pullquotes with glossary terms.
   *
   * @covers ::transformAll
   */
  public function testTransformers(): void {
    $this->checkPullquoteWithGlossary();
  }

  /**
   * Tests pullquote with glossary.
   *
   * @covers ::transformAll
   */
  public function checkPullquoteWithGlossary(): void {
    $input = '<div class="pullquote"><p class="pullquote-text">I lost them all and it had a huge impact. I wanted to do more. I wanted to learn how to do a better job at taking care of the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045417&amp;version=Patient&amp;language=English">quality of life</a> issues that people with cancer face.</p><p class="author">Terri Armstrong, Ph.D.</p></div>';
    $output = $this->transformerManager->transformAll($input);
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--full"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">I lost them all and it had a huge impact. I wanted to do more. I wanted to learn how to do a better job at taking care of the <nci-definition data-gloss-id="45417" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">quality of life</nci-definition> issues that people with cancer face.</p><p class="cgdp-pullquote__author">Terri Armstrong, Ph.D.</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform pullquote with glossary');
  }

}
