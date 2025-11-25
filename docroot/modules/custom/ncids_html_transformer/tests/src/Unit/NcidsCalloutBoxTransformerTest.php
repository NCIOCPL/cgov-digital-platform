<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsCalloutBoxTransformer;
use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Callout Box Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsCalloutBoxTransformer
 */
class NcidsCalloutBoxTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsCalloutBoxTransformer
   */
  protected $transformer;

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
    $this->transformer = new NcidsCalloutBoxTransformer($this->transfomerManager);
  }

  /**
   * Test preProcessHtml method.
   *
   * @covers ::preProcessHtml
   */
  public function testPreProcessHtml() {
    $original_html =
      '<div class="callout-box"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-left"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-right"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-center"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-full"><p>This is an info callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<div class="callout-box" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-left" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-right" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-center" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-full" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
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
      '<div class="callout-box" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-left" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-right" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-center" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-full" data-html-transformer="NcidsCalloutBoxTransformer"><p>This is an info callout box.</p></div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';
    $expected_html =
      '<div class="callout-box"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-left"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-right"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-center"><p>This is an info callout box.</p></div>' .
      '<div class="callout-box-full"><p>This is an info callout box.</p></div>' .
      '<div class="test" data-html-transformer="NotThis"><p>This is not a callout box.</p></div>' .
      '<div class="chicken"><p>This is not a callout box.</p></div>';

    $processed_html = $this->transformer->postProcessHtml($original_html);
    $this->assertEquals($expected_html, $processed_html);
  }

  /**
   * Integration-like test for pre/post transformation process.
   *
   * @covers ::preProcessHtml
   * @covers ::transform
   * @covers ::postProcessHtml
   */
  public function testSimpleIntegrationTest() {
    $input = '<div class="callout-box"><p>This is an info callout box.</p></div>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="align-center embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text"><p>This is an info callout box.</p></div></div></div></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);

    $this->assertEquals($expected, $post_processed, 'Callout box should be preserved through full transformation process.');
  }

  /**
   * Tests full-width callout box transformation with links.
   *
   * @covers ::transform
   */
  public function testCalloutBox1(): void {
    $input = '<aside class="callout-box-full">
      <p><strong>PRE-APPLICATION WEBINAR RECORDING AND SLIDES</strong></p>
      <p>
        <a href="https://cbiit.webex.com/cbiit/ldr.php?RCID=fd790ee0e85c3428c6b68a88b459d99d">
          <strong>Watch the recording</strong>
        </a>
        <a class="icon-exit-notification" title="Exit Disclaimer" href="/policies/linking">
          <span class="show-for-sr">Exit Disclaimer</span>
        </a>
        <strong> and </strong>
        <a href="/about-nci/organization/crchd/disparities-research/collaborative-web-slides" data-entity-type="media" data-entity-uuid="a0b161bb-ae73-41bf-be21-8a07ff0c59b8" data-entity-substitution="canonical">
          <strong>access the slides</strong>
        </a><strong> from the July 30, 2024 Collaborative pre-application webinar.&nbsp;</strong>
      </p>
    </aside>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--full"><aside class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text"><p><strong>PRE-APPLICATION WEBINAR RECORDING AND SLIDES</strong></p>
      <p>
        <a href="https://cbiit.webex.com/cbiit/ldr.php?RCID=fd790ee0e85c3428c6b68a88b459d99d">
          <strong>Watch the recording</strong>
        </a>
        <a class="icon-exit-notification" title="Exit Disclaimer" href="/policies/linking">
          <span class="show-for-sr">Exit Disclaimer</span>
        </a>
        <strong> and </strong>
        <a href="/about-nci/organization/crchd/disparities-research/collaborative-web-slides" data-entity-type="media" data-entity-uuid="a0b161bb-ae73-41bf-be21-8a07ff0c59b8" data-entity-substitution="canonical">
          <strong>access the slides</strong>
        </a><strong> from the July 30, 2024 Collaborative pre-application webinar.&nbsp;</strong>
      </p></div></div></aside></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected, $post_processed, 'Should transform full-width callout box with links and maintain all link attributes');
  }

  /**
   * Tests full-width callout box with heading and list content.
   *
   * @covers ::transform
   */
  public function testCalloutBox2(): void {
    $input = '<aside class="callout-box-full">
    <h3>What\'s in a CAR T-cell?</h3>
      <p>Although there are important differences between each of the approved CAR T-cell therapies that can affect how they function in patients, they share similar&nbsp;<span style="font-weight:400;">components and designs.</span></p>
      <ul>
        <li>Each CAR on an individual T cell spans the cell membrane, with part of the receptor sitting outside the cell and part within the cell.</li>
        <li>The external part of the CAR is composed of fragments, or domains, of lab-made <a data-gloss-id="44918" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" href="/publications/dictionaries/cancer-terms/def/44918" class="definition">antibodies</a>. Which domains are used affects the receptor\'s ability to recognize or bind to its target antigen on tumor cells.</li>
        <li>The internal part of each CAR has "signaling" and "co-stimulatory" domains. After the receptor binds to an antigen on a tumor cell, these domains transmit signals inside the T cells that help them multiply further in the body.</li>
      </ul></aside>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--full"><aside class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-summary-box__heading">What\'s in a CAR T-cell?</div><div class="usa-prose usa-summary-box__text"><p>Although there are important differences between each of the approved CAR T-cell therapies that can affect how they function in patients, they share similar&nbsp;<span style="font-weight:400;">components and designs.</span></p>
      <ul>
        <li>Each CAR on an individual T cell spans the cell membrane, with part of the receptor sitting outside the cell and part within the cell.</li>
        <li>The external part of the CAR is composed of fragments, or domains, of lab-made <a data-gloss-id="44918" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" href="/publications/dictionaries/cancer-terms/def/44918" class="definition">antibodies</a>. Which domains are used affects the receptor\'s ability to recognize or bind to its target antigen on tumor cells.</li>
        <li>The internal part of each CAR has "signaling" and "co-stimulatory" domains. After the receptor binds to an antigen on a tumor cell, these domains transmit signals inside the T cells that help them multiply further in the body.</li>
      </ul></div></div></aside></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected, $post_processed, 'Should transform full-width callout box with heading and list content');
  }

  /**
   * Tests right-aligned callout box with simple text content.
   *
   * @covers ::transform
   */
  public function testCalloutBox3(): void {
    $input = '<aside class="callout-box-right">
      <p>Connected health&nbsp;is the use of technology to facilitate the efficient and effective collection, flow, and use of health information.</p>
    </aside>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="align-right embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><aside class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text"><p>Connected health&nbsp;is the use of technology to facilitate the efficient and effective collection, flow, and use of health information.</p></div></div></aside></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected, $post_processed, 'Should transform right-aligned callout box with basic text content');
  }

  /**
   * Tests left-aligned callout box with linked heading.
   *
   * @covers ::transform
   */
  public function testCalloutBox4(): void {
    $input = '<div class="callout-box-left">
    <h3><a href="https://directorsblog.nih.gov/2024/06/27/molecular-portrait-of-key-driver-of-pancreatic-cancer-offers-hope-for-continued-treatment-advances">Molecular Portrait of Key Driver of Pancreatic Cancer Offers Hope for Continued Treatment Advances</a></h3>
      <p>Researchers have established the most comprehensive molecular portrait yet of the workings of KRAS and how its many downstream impacts may influence outcomes for people with pancreatic cancer.</p>
    </div>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="align-left embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-summary-box__heading"><a href="https://directorsblog.nih.gov/2024/06/27/molecular-portrait-of-key-driver-of-pancreatic-cancer-offers-hope-for-continued-treatment-advances">Molecular Portrait of Key Driver of Pancreatic Cancer Offers Hope for Continued Treatment Advances</a></div><div class="usa-prose usa-summary-box__text"><p>Researchers have established the most comprehensive molecular portrait yet of the workings of KRAS and how its many downstream impacts may influence outcomes for people with pancreatic cancer.</p></div></div></div></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected, $post_processed, 'Should transform left-aligned callout box with linked heading');
  }

  /**
   * Tests class="callout-box".
   *
   * @covers ::transform
   */
  public function testCalloutBox5(): void {
    $input = '<div class="callout-box">
      <center>
        <p>
          <a href="https://public.govdelivery.com/accounts/USNIHNCI/subscriber/new?topic_id=USNIHNCI_223">Sign up to get stories like this and CCDI updates in your inbox</a>
        </p>
      </center>
    </div>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="align-center embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text"><center>
        <p>
          <a href="https://public.govdelivery.com/accounts/USNIHNCI/subscriber/new?topic_id=USNIHNCI_223">Sign up to get stories like this and CCDI updates in your inbox</a>
        </p>
      </center></div></div></div></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected, $post_processed, 'Should transform standard callout box with medium size by default');
  }

  /**
   * Tests callout box with comment and heading.
   *
   * @covers ::transform
   */
  public function testCalloutBoxWithCommentAndHeading() : void {
    $input = '<div class="callout-box"> <!-- This is a comment --> <h2>Important Notice</h2><p>Please read the following information carefully.</p></div>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="align-center embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small">' .
      '<div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-summary-box__heading">Important Notice</div>' .
      '<div class="usa-prose usa-summary-box__text">' .
      '<!-- This is a comment --> <p>Please read the following information carefully.</p></div></div></div></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected, $post_processed, 'Should transform callout box with comment and heading, removing the comment.');
  }

  /**
   * Tests callout box with text node and heading.
   *
   * @covers ::transform
   */
  public function testCalloutBoxWithTextNodeAndHeading() : void {
    $input = '<div class="callout-box">
      Some introductory text.
      <h2>Key Information</h2>
      <p>This section contains key information.</p>
    </div>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="align-center embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text">Some introductory text.
      <h2>Key Information</h2>
      <p>This section contains key information.</p></div></div></div></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected, $post_processed, 'Should transform callout box with text node and heading, preserving the text node.');
  }

  /**
   * Tests callout box with paragraph before heading.
   *
   * @covers ::transform
   */
  public function testCalloutBoxWithParagraphBeforeHeading() : void {
    $input = '<div class="callout-box">
      <p>Introductory paragraph.</p>
      <h2>Main Heading</h2>
      <p>Details under the main heading.</p>
    </div>';
    $expected = '<div class="cgdp-embed-media-wrapper"><div class="align-center embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text"><p>Introductory paragraph.</p>
      <h2>Main Heading</h2>
      <p>Details under the main heading.</p></div></div></div></div></div>';

    // Simulate full transformation process.
    $pre_processed = $this->transformer->preProcessHtml($input);
    $transformed = $this->transformer->transform($pre_processed);
    $post_processed = $this->transformer->postProcessHtml($transformed);
    $this->assertEquals($expected, $post_processed, 'Should transform callout box with paragraph before heading, preserving the paragraph.');
  }

}
