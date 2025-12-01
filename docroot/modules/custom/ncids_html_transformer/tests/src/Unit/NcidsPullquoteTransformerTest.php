<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;
use Drupal\ncids_html_transformer\Services\NcidsPullquoteTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Pullquote Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsPullquoteTransformer
 */
class NcidsPullquoteTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsPullquoteTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $transformer_manager = new NcidsHtmlTransformerManager();
    $this->transformer = new NcidsPullquoteTransformer($transformer_manager);
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<div class="pullquote">Quote content</div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<div class="pullquote" data-html-transformer="NcidsPullquoteTransformer">Quote content</div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';

    $processed_html = $this->transformer->preProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Test postProcessHtml method.
   *
   * @covers ::postProcessHtml
   */
  public function testPostProcessHtml() {
    $original_html =
      '<div class="pullquote" data-html-transformer="NcidsPullquoteTransformer">Quote content</div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<div class="pullquote">Quote content</div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Tests Full width pullquote.
   *
   * @covers ::transform
   */
  public function testFullWidthPullquoteWithAuthor(): void {
    $input = '<div class="pullquote"><p class="pullquote-text">I lost them all and it had a huge impact. I wanted to do more. I wanted to learn how to do a better job at taking care of the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045417&amp;version=Patient&amp;language=English">quality of life</a> issues that people with cancer face.</p><p class="author">Terri Armstrong, Ph.D.</p></div>';
    $tmp = $this->transformer->preProcessHtml($input);
    $tmp = $this->transformer->transform($tmp);
    $output = $this->transformer->postProcessHtml($tmp);
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--full"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">I lost them all and it had a huge impact. I wanted to do more. I wanted to learn how to do a better job at taking care of the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045417&amp;version=Patient&amp;language=English">quality of life</a> issues that people with cancer face.</p><p class="cgdp-pullquote__author">Terri Armstrong, Ph.D.</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform full-width pullquote with links and maintain all link attributes');
  }

  /**
   * Tests pullquote-left.
   *
   * @covers ::transform
   */
  public function testLeftAlignPullquoteWithAuthor(): void {
    $input = '<div class="pullquote pullquote-left"><p class="pullquote-text">I saw patients\' hope for the future restored. Now, 20 years later, I\'ve witnessed all that these patients have experienced—weddings, children, grandchildren—and many more life events...</p><p class="author">Dr. Brian Druker, oncologist</p></div>';
    $tmp = $this->transformer->preProcessHtml($input);
    $tmp = $this->transformer->transform($tmp);
    $output = $this->transformer->postProcessHtml($tmp);
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--small align-left"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">I saw patients\' hope for the future restored. Now, 20 years later, I\'ve witnessed all that these patients have experienced—weddings, children, grandchildren—and many more life events...</p><p class="cgdp-pullquote__author">Dr. Brian Druker, oncologist</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform left aligned pullquote with links and maintain all link attributes');
  }

  /**
   * Tests pullquote-right.
   *
   * @covers ::transform
   */
  public function testRightAlignPullquoteWithAuthor(): void {
    $input = '<div class="pullquote pullquote-right"><p class="pullquote-text">I think it\'s very important for the doctors, nurses, and support staff to explain things to patients and their families in a confident, clear, and concise manner. It\'s also important for patients to be able to talk to the medical staff without any boundaries.</p><p class="author">Colin</p></div>';
    $tmp = $this->transformer->preProcessHtml($input);
    $tmp = $this->transformer->transform($tmp);
    $output = $this->transformer->postProcessHtml($tmp);
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--small align-right"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">I think it\'s very important for the doctors, nurses, and support staff to explain things to patients and their families in a confident, clear, and concise manner. It\'s also important for patients to be able to talk to the medical staff without any boundaries.</p><p class="cgdp-pullquote__author">Colin</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform right aligned pullquote with links and maintain all link attributes');
  }

  /**
   * Tests pullquote-center.
   *
   * @covers ::transform
   */
  public function testCenterAlignPullquoteWithAuthor(): void {
    $input = '<div class="pullquote pullquote-center"><p class="pullquote-text">The highlight of my internship was the weekly meetings [where] we got to know the other summer interns and share all the fun and exciting things we were learning. Being a summer intern at NCI was intellectually enlightening and transformative.</p><p class="author">Andrea N. Robinson, Former CRI participant</p></div>';
    $tmp = $this->transformer->preProcessHtml($input);
    $tmp = $this->transformer->transform($tmp);
    $output = $this->transformer->postProcessHtml($tmp);
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--small align-center"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">The highlight of my internship was the weekly meetings [where] we got to know the other summer interns and share all the fun and exciting things we were learning. Being a summer intern at NCI was intellectually enlightening and transformative.</p><p class="cgdp-pullquote__author">Andrea N. Robinson, Former CRI participant</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform center aligned pullquote with links and maintain all link attributes');
  }

  /**
   * Tests without author.
   *
   * @covers ::transform
   */
  public function testPullquoteWithoutAuthor(): void {
    $input = '<div class="pullquote"><p class="pullquote-text">The highlight of my internship was the weekly meetings [where] we got to know the other summer interns and share all the fun and exciting things we were learning. Being a summer intern at NCI was intellectually enlightening and transformative.</p></div>';
    $tmp = $this->transformer->preProcessHtml($input);
    $tmp = $this->transformer->transform($tmp);
    $output = $this->transformer->postProcessHtml($tmp);
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--full"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">The highlight of my internship was the weekly meetings [where] we got to know the other summer interns and share all the fun and exciting things we were learning. Being a summer intern at NCI was intellectually enlightening and transformative.</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform pullquote without author');
  }

  /**
   * Tests pullquote with only author.
   *
   * This is more of a test of not blowing up.
   *
   * @covers ::transform
   */
  public function testPullquoteWithOnlyAuthor(): void {
    $input = '<div class="pullquote"><p class="author">Andrea N. Robinson, Former CRI participant</p></div>';
    $tmp = $this->transformer->preProcessHtml($input);
    $tmp = $this->transformer->transform($tmp);
    $output = $this->transformer->postProcessHtml($tmp);
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--full"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__author">Andrea N. Robinson, Former CRI participant</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform pullquote with only author');
  }

  /**
   * Tests empty pullquote.
   *
   * This is more of a test of not blowing up.
   *
   * @covers ::transform
   */
  public function testEmptyPullquote(): void {
    $input = '<div class="pullquote"></div>';
    $tmp = $this->transformer->preProcessHtml($input);
    $tmp = $this->transformer->transform($tmp);
    $output = $this->transformer->postProcessHtml($tmp);
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--full"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should not break on empty pullquote');
  }

}
