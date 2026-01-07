<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsUnwrapTransformer;
use Drupal\Tests\UnitTestCase;
use Psr\Log\LoggerInterface;

/**
 * Tests Ncids Unwrap Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsUnwrapTransformer
 */
class NcidsUnwrapTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsUnwrapTransformer
   */
  protected $transformer;

  /**
   * The mock logger.
   *
   * @var \PHPUnit\Framework\MockObject\MockObject&\Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->logger = $this->createMock(LoggerInterface::class);
    $this->transformer = new NcidsUnwrapTransformer($this->logger);
  }

  /**
   * Wrap orphaned anchor tag at body level in paragraph.
   *
   * @covers ::transform
   */
  public function testWrapOrphanedAnchorTag() {
    $original = '<a href="/x">Link</a>';
    $expected = '<p><a href="/x">Link</a></p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <center> with multiple children preserves order.
   *
   * @covers ::transform
   */
  public function testUnwrapCenterMultipleChildren() {
    $original = '<center><p>A</p><a href="#">L</a></center>';
    $expected = '<p>A</p><p><a href="#">L</a></p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap Office <o:p> wrapper.
   *
   * @covers ::transform
   */
  public function testUnwrapOfficeOp() {
    $original = '<p>Start</p><o:p><span>Inner</span></o:p><p>End</p>';
    $expected = '<p>Start</p><p>Inner</p><p>End</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap plain div under body.
   *
   * @covers ::transform
   */
  public function testUnwrapPlainDivUnderBody() {
    $original = '<div><p>Text</p></div>';
    $expected = '<p>Text</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Keep structural div with allowlisted class.
   *
   * @covers ::transform
   */
  public function testKeepStructuralDiv() {
    $original = '<div class="cgdp-embed-media-wrapper"><p>Text</p></div>';
    $expected = '<div class="cgdp-embed-media-wrapper"><p>Text</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap div directly wrapping drupal-entity.
   *
   * @covers ::transform
   */
  public function testUnwrapDivWrappingDrupalEntity() {
    $original = '<div><drupal-entity data-entity-type="media"></drupal-entity></div>';
    $expected = '<drupal-entity data-entity-type="media"></drupal-entity>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap plain div but keep div with grid-row class.
   *
   * @covers ::transform
   */
  public function testUnwrapPlainDivButKeepGridRowDiv() {
    $original = '<div><p>Text</p></div><div class="grid-row"><p>Keep</p></div>';
    $expected = '<p>Text</p><div class="grid-row"><p>Keep</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap divs inside anchor tags and restructure to match CKEditor.
   *
   * @covers ::transform
   */
  public function testUnwrapDivInsideAnchorTag() {
    $original = '<a href="/test"><div><img src="/image.jpg" alt="Test"></div><h3>Title</h3><p>Text</p></a>';
    $expected = '<p><a href="/test"><img src="/image.jpg" alt="Test"></a></p><h3><a href="/test">Title</a></h3><p><a href="/test">Text</a></p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap div inside anchor tag, restructure anchor, and wrap in paragraph.
   *
   * @covers ::transform
   */
  public function testUnwrapDivInsideAnchorMergesText() {
    $original = '<a href="/test"><div>This is anchor tag text</div></a>';
    $expected = '<p><a href="/test">This is anchor tag text</a></p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Do NOT unwrap divs inside table cells.
   *
   * @covers ::transform
   */
  public function testUnwrapDivInsideTableCell() {
    $original = '<table><tbody><tr><td><div><p>Cell content</p></div></td></tr></tbody></table>';
    $expected = '<table><tbody><tr><td><p>Cell content</p></td></tr></tbody></table>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <g> element and wrap orphaned text in <p>.
   *
   * @covers ::transform
   */
  public function testUnwrapElementG() {
    $original = '<p>Before</p><g>Content</g><p>After</p>';
    $expected = '<p>Before</p><p>Content</p><p>After</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <pre> element.
   *
   * @covers ::transform
   */
  public function testUnwrapPreElement() {
    $original = '<pre><p>Preformatted text</p></pre>';
    $expected = '<p>Preformatted text</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <u> (underline) element.
   *
   * @covers ::transform
   */
  public function testUnwrapUnderlineElement() {
    $original = '<p>Some <u>underlined</u> text</p>';
    $expected = '<p>Some underlined text</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <nonomasticon> element.
   *
   * @covers ::transform
   */
  public function testUnwrapNonomasticonElement() {
    $original = '<p><nonomasticon>Term</nonomasticon> definition</p>';
    $expected = '<p>Term definition</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <small> element.
   *
   * @covers ::transform
   */
  public function testUnwrapSmallElement() {
    $original = '<p>Normal text <small>small text</small></p>';
    $expected = '<p>Normal text small text</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap multiple nested plain divs in one pass.
   *
   * @covers ::transform
   */
  public function testUnwrapNestedPlainDivs() {
    $original = '<div><div><div><p>Deep content</p></div></div></div>';
    $expected = '<p>Deep content</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap mixed nested divs with some structural classes.
   *
   * @covers ::transform
   */
  public function testUnwrapNestedMixedDivs() {
    $original = '<div><div class="grid-row"><div><p>Content</p></div></div></div>';
    $expected = '<div class="grid-row"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Wrap orphaned <i> element in <p> tag.
   *
   * @covers ::transform
   */
  public function testWrapOrphanedItalicElement() {
    $original = '<p>Normal paragraph</p><i>Orphaned italic</i><p>Another paragraph</p>';
    $expected = '<p>Normal paragraph</p><p><i>Orphaned italic</i></p><p>Another paragraph</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Wrap orphaned <strong> element in <p> tag.
   *
   * @covers ::transform
   */
  public function testWrapOrphanedStrongElement() {
    $original = '<h2>Heading</h2><strong>Orphaned bold</strong><ul><li>List</li></ul>';
    $expected = '<h2>Heading</h2><p><strong>Orphaned bold</strong></p><ul><li>List</li></ul>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Keep grid-col structural class.
   *
   * @covers ::transform
   */
  public function testKeepGridColDiv() {
    $original = '<div class="grid-col"><p>Column content</p></div>';
    $expected = '<div class="grid-col"><p>Column content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Keep usa-alert structural class.
   *
   * @covers ::transform
   */
  public function testKeepUsaAlertDiv() {
    $original = '<div class="usa-alert"><p>Alert content</p></div>';
    $expected = '<div class="usa-alert"><p>Alert content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Keep usa-accordion structural class.
   *
   * @covers ::transform
   */
  public function testKeepUsaAccordionDiv() {
    $original = '<div class="usa-accordion"><p>Accordion content</p></div>';
    $expected = '<div class="usa-accordion"><p>Accordion content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Keep usa-graphic-list structural class.
   *
   * @covers ::transform
   */
  public function testKeepUsaGraphicListDiv() {
    $original = '<div class="usa-graphic-list"><ul><li>Item</li></ul></div>';
    $expected = '<div class="usa-graphic-list"><ul><li>Item</li></ul></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Keep summary-box wrapper (both usa-prose and __SUMMARY_BOX_TEXT__ classes).
   *
   * @covers ::transform
   */
  public function testKeepSummaryBoxWrapperItself() {
    $original = '<div class="usa-prose usa-summary-box__text"><p>Summary content</p></div>';
    $expected = '<div class="usa-prose usa-summary-box__text"><p>Summary content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap div with <b> and add <p> parent after unwrap.
   *
   * @covers ::transform
   */
  public function testUnwrapDivWithBoldChild() {
    $original = '<div><b>Bold text</b></div>';
    $expected = '<p><b>Bold text</b></p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Complex scenario: unwrap plain divs but preserve structure in anchor.
   *
   * @covers ::transform
   */
  public function testComplexScenarioWithAnchorAndDivs() {
    $original = '<div><a href="/link"><div class="cgdp-embed-media-wrapper"><img src="/img.jpg" alt="Alt"></div><h3>Title</h3></a></div><div><p>Paragraph</p></div>';
    $expected = '<div class="cgdp-embed-media-wrapper"><a href="/link"><img src="/img.jpg" alt="Alt"></a></div><h3><a href="/link">Title</a></h3><p>Paragraph</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Skip over data-html-transformer attribute.
   *
   * @covers ::transform
   */
  public function testKeepParagraphWithDataHtmlTransformerAttribute() {
    $original = '<div data-html-transformer="foo">Link</div>';
    $expected = '<div data-html-transformer="foo">Link</div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Wrap orphaned text node in <p> tag.
   */
  public function testWrapOrphanedTextNode() {
    $original = '<p>First</p>Orphaned text<p>Last</p>';
    $expected = '<p>First</p><p>Orphaned text</p><p>Last</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Group multiple consecutive orphaned phrasing elements in one <p>.
   */
  public function testGroupConsecutiveOrphanedPhrasingElements() {
    $original = '<h2>Title</h2><strong>Bold</strong> <em>Italic</em> <span>Text</span><p>Next</p>';
    $expected = '<h2>Title</h2><p><strong>Bold</strong> <em>Italic</em> Text</p><p>Next</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap spans with no attributes.
   */
  public function testUnwrapSpanWithNoAttributes() {
    $original = '<p>Text with <span>plain span</span> content</p>';
    $expected = '<p>Text with plain span content</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Keep div with id attribute.
   */
  public function testKeepDivWithId() {
    $original = '<div id="important-section"><p>Content</p></div>';
    $expected = '<div id="important-section"><p>Content</p></div>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Anchor with only phrasing content should NOT be restructured.
   */
  public function testAnchorWithOnlyPhrasingContentNotRestructured() {
    $original = '<a href="/test"><strong>Bold link</strong> text</a>';
    $expected = '<p><a href="/test"><strong>Bold link</strong> text</a></p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Text in blockquote should be wrapped in paragraph.
   */
  public function testTextInBlockquoteWrappedInParagraph() {
    $original = '<blockquote>This is a quote</blockquote>';
    $expected = '<blockquote><p>This is a quote</p></blockquote>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap nested ALWAYS_UNWRAP elements.
   */
  public function testUnwrapNestedAlwaysUnwrapElements() {
    $original = '<p><u><small>nested text</small></u></p>';
    $expected = '<p>nested text</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap plain section element.
   */
  public function testUnwrapPlainSection() {
    $original = '<section><p>Content</p></section>';
    $expected = '<p>Content</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Keep section with class attribute.
   */
  public function testKeepSectionWithClass() {
    $original = '<section class="intro"><p>Content</p></section>';
    $expected = '<section class="intro"><p>Content</p></section>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap consecutive ALWAYS_UNWRAP elements and merge in single paragraph.
   */
  public function testUnwrapConsecutiveAlwaysUnwrapElements() {
    $original = '<p>Start</p><u>text1</u><small>text2</small><center>text3</center><p>End</p>';
    $expected = '<p>Start</p><p>text1text2text3</p><p>End</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Original paragraphs should not merge with added paragraphs.
   */
  public function testOriginalParagraphsDoNotMerge() {
    $original = '<p>Original paragraph</p><strong>Orphaned text</strong>';
    $expected = '<p>Original paragraph</p><p><strong>Orphaned text</strong></p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap multiple nested divs around drupal-entity.
   */
  public function testUnwrapMultipleDivsAroundDrupalEntity() {
    $original = '<div><div><drupal-entity data-entity-type="media"></drupal-entity></div></div>';
    $expected = '<drupal-entity data-entity-type="media"></drupal-entity>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Group mixed orphaned content type (text, inline elements) in one paragraph.
   */
  public function testMixedOrphanedContentGrouping() {
    $original = '<h2>Title</h2>Plain text <strong>bold</strong> <a href="#">link</a><p>Para</p>';
    $expected = '<h2>Title</h2><p>Plain text <strong>bold</strong> <a href="#">link</a></p><p>Para</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Original paragraph between block elements marked non-mergeable.
   */
  public function testOriginalParagraphBetweenBlocksNotMergeable() {
    $original = '<h2>Title</h2><p>Paragraph</p><ul><li>List</li></ul>';
    $expected = '<h2>Title</h2><p>Paragraph</p><ul><li>List</li></ul>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Preserve HTML comments in output.
   */
  public function testPreserveHtmlComments() {
    $original = '<p>Text</p><!-- This is a comment --><p>More</p>';
    $expected = '<p>Text</p><!-- This is a comment --><p>More</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Handle whitespace correctly without creating empty paragraphs.
   */
  public function testWhitespaceHandling() {
    $original = '<p>Text</p>   <p>More</p>';
    $expected = '<p>Text</p><p>More</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <font> element at body level and wrap in paragraph.
   *
   * @covers ::transform
   */
  public function testUnwrapFontElementAtBodyLevel() {
    $original = '<font>hello</font>';
    $expected = '<p>hello</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <font> element inside paragraph.
   *
   * @covers ::transform
   */
  public function testUnwrapFontElementInsideParagraph() {
    $original = '<p><font>Hello</font></p>';
    $expected = '<p>Hello</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap <font> element with mixed content.
   *
   * @covers ::transform
   */
  public function testUnwrapFontElementWithMixedContent() {
    $original = '<p>Start <font>middle</font> end</p>';
    $expected = '<p>Start middle end</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

  /**
   * Unwrap consecutive <font> elements and merge in single paragraph.
   *
   * @covers ::transform
   */
  public function testUnwrapConsecutiveFontElements() {
    $original = '<p>Start</p><font>text1</font><font>text2</font><p>End</p>';
    $expected = '<p>Start</p><p>text1text2</p><p>End</p>';
    $output = $this->transformer->transform($original);
    $this->assertEquals($expected, $output);
  }

}
