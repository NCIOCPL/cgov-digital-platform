<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;
use Drupal\ncids_html_transformer\Services\NcidsPullquoteTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Callout Box Transformer Service.
 *
 * @group ncids_html_transformer
 */
class PullquoteTrasnformerTest extends UnitTestCase {

  /**
   * The pullquote transformer.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsPullquoteTransformer
   */
  protected $pullquoteTransformer;

  /**
   * The transformer manager.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
   */
  protected $transfomerManager;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->transfomerManager = new NcidsHtmlTransformerManager();
    $this->pullquoteTransformer = new NcidsPullquoteTransformer($this->transfomerManager);
  }

  /**
   * Tests pullquote.
   *
   * @Covers::transform
   */
  public function testPullquote1(): void {
    $input = '<div class="pullquote" data-html-transformer="pullquote"><p class="pullquote-text">I lost them all and it had a huge impact. I wanted to do more. I wanted to learn how to do a better job at taking care of the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045417&amp;version=Patient&amp;language=English">quality of life</a> issues that people with cancer face.</p><p class="author">Terri Armstrong, Ph.D.</p></div>';
    $output = $this->pullquoteTransformer->transform($input);
    $expected = '<div class="cgdp-embed-media-wrapper" data-html-transformer="pullquote"><div class="embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--full"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">I lost them all and it had a huge impact. I wanted to do more. I wanted to learn how to do a better job at taking care of the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045417&amp;version=Patient&amp;language=English">quality of life</a> issues that people with cancer face.</p><p class="cgdp-pullquote__author">Terri Armstrong, Ph.D.</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform full-width callout box with links and maintain all link attributes');
  }

  /**
   * Tests pullquote-left.
   *
   * @Covers::transform
   */
  public function testPullquote2(): void {
    $input = '<div class="pullquote pullquote-left" data-html-transformer="pullquote"><p class="pullquote-text">I saw patients\' hope for the future restored. Now, 20 years later, I\'ve witnessed all that these patients have experienced—weddings, children, grandchildren—and many more life events...</p><p class="author">Dr. Brian Druker, oncologist</p></div>';
    $output = $this->pullquoteTransformer->transform($input);
    $expected = '<div class="cgdp-embed-media-wrapper" data-html-transformer="pullquote"><div class="align-left embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--small"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">I saw patients\' hope for the future restored. Now, 20 years later, I\'ve witnessed all that these patients have experienced—weddings, children, grandchildren—and many more life events...</p><p class="cgdp-pullquote__author">Dr. Brian Druker, oncologist</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform full-width callout box with links and maintain all link attributes');
  }

  /**
   * Tests pullquote-right.
   *
   * @Covers::transform
   */
  public function testPullquote3(): void {
    $input = '<div class="pullquote pullquote-right" data-html-transformer="pullquote"><p class="pullquote-text">I think it\'s very important for the doctors, nurses, and support staff to explain things to patients and their families in a confident, clear, and concise manner. It\'s also important for patients to be able to talk to the medical staff without any boundaries.</p><p class="author">Colin</p></div>';
    $output = $this->pullquoteTransformer->transform($input);
    $expected = '<div class="cgdp-embed-media-wrapper" data-html-transformer="pullquote"><div class="align-right embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--small"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">I think it\'s very important for the doctors, nurses, and support staff to explain things to patients and their families in a confident, clear, and concise manner. It\'s also important for patients to be able to talk to the medical staff without any boundaries.</p><p class="cgdp-pullquote__author">Colin</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform full-width callout box with links and maintain all link attributes');
  }

  /**
   * Tests pullquote-center.
   *
   * @Covers::transform
   */
  public function testPullquote4(): void {
    $input = '<div class="pullquote pullquote-center" data-html-transformer="pullquote"><p class="pullquote-text">The highlight of my internship was the weekly meetings [where] we got to know the other summer interns and share all the fun and exciting things we were learning. Being a summer intern at NCI was intellectually enlightening and transformative.</p><p class="author">Andrea N. Robinson, Former CRI participant</p></div>';
    $output = $this->pullquoteTransformer->transform($input);
    $expected = '<div class="cgdp-embed-media-wrapper" data-html-transformer="pullquote"><div class="align-center embedded-entity cgdp-embed-pullquote cgdp-embed-pullquote--small"><div class="cgdp-pullquote"><div class="cgdp-pullquote__container"><p class="cgdp-pullquote__body">The highlight of my internship was the weekly meetings [where] we got to know the other summer interns and share all the fun and exciting things we were learning. Being a summer intern at NCI was intellectually enlightening and transformative.</p><p class="cgdp-pullquote__author">Andrea N. Robinson, Former CRI participant</p></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform full-width callout box with links and maintain all link attributes');
  }

}
