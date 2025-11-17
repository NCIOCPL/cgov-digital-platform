<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsCalloutBoxTransformer;
use Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Callout Box Transformer Service.
 *
 * @group ncids_html_transformer
 */
class CalloutBoxTransformerTest extends UnitTestCase {

  /**
   * The callout box transformer.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsCalloutBoxTransformer
   */
  protected $calloutBoxTransformer;

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
    $this->calloutBoxTransformer = new NcidsCalloutBoxTransformer($this->transfomerManager);
  }

  /**
   * Tests full-width callout box transformation with links.
   *
   * @Covers::transform
   */
  public function testCalloutBox1(): void {
    $input = '<aside class="callout-box-full" data-html-transformer="callout-box-full">
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
    $output = $this->calloutBoxTransformer->transform($input);
    $expected = '<aside class="cgdp-embed-media-wrapper" data-html-transformer="callout-box-full"><div class="embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--full"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text"><p><strong>PRE-APPLICATION WEBINAR RECORDING AND SLIDES</strong></p>
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
      </p></div></div></div></div></aside>';
    $this->assertEquals($expected, $output, 'Should transform full-width callout box with links and maintain all link attributes');
  }

  /**
   * Tests full-width callout box with heading and list content.
   *
   * @Covers::transform
   */
  public function testCalloutBox2(): void {
    $input = '<aside class="callout-box-full" data-html-transformer="callout-box-full">
      <h3>What\'s in a CAR T-cell?</h3>
      <p>Although there are important differences between each of the approved CAR T-cell therapies that can affect how they function in patients, they share similar&nbsp;<span style="font-weight:400;">components and designs.</span></p>
      <ul>
        <li>Each CAR on an individual T cell spans the cell membrane, with part of the receptor sitting outside the cell and part within the cell.</li>
        <li>The external part of the CAR is composed of fragments, or domains, of lab-made <a data-gloss-id="44918" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" href="/publications/dictionaries/cancer-terms/def/44918" class="definition">antibodies</a>. Which domains are used affects the receptor\'s ability to recognize or bind to its target antigen on tumor cells.</li>
        <li>The internal part of each CAR has "signaling" and "co-stimulatory" domains. After the receptor binds to an antigen on a tumor cell, these domains transmit signals inside the T cells that help them multiply further in the body.</li>
      </ul>
    </aside>';
    $output = $this->calloutBoxTransformer->transform($input);
    $expected = '<aside class="cgdp-embed-media-wrapper" data-html-transformer="callout-box-full"><div class="embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--full"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-summary-box__heading">What\'s in a CAR T-cell?</div><div class="usa-prose usa-summary-box__text"><p>Although there are important differences between each of the approved CAR T-cell therapies that can affect how they function in patients, they share similar&nbsp;<span style="font-weight:400;">components and designs.</span></p>
      <ul>
        <li>Each CAR on an individual T cell spans the cell membrane, with part of the receptor sitting outside the cell and part within the cell.</li>
        <li>The external part of the CAR is composed of fragments, or domains, of lab-made <a data-gloss-id="44918" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en" href="/publications/dictionaries/cancer-terms/def/44918" class="definition">antibodies</a>. Which domains are used affects the receptor\'s ability to recognize or bind to its target antigen on tumor cells.</li>
        <li>The internal part of each CAR has "signaling" and "co-stimulatory" domains. After the receptor binds to an antigen on a tumor cell, these domains transmit signals inside the T cells that help them multiply further in the body.</li>
      </ul></div></div></div></div></aside>';
    $this->assertEquals($expected, $output, 'Should transform full-width callout box with heading and list content');
  }

  /**
   * Tests right-aligned callout box with simple text content.
   *
   * @Covers::transform
   */
  public function testCalloutBox3(): void {
    $input = '<aside class="callout-box-right" data-html-transformer="callout-box-right">
      <p>Connected health&nbsp;is the use of technology to facilitate the efficient and effective collection, flow, and use of health information.</p>
    </aside>';
    $output = $this->calloutBoxTransformer->transform($input);
    $expected = '<aside class="cgdp-embed-media-wrapper" data-html-transformer="callout-box-right"><div class="align-right embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text"><p>Connected health&nbsp;is the use of technology to facilitate the efficient and effective collection, flow, and use of health information.</p></div></div></div></div></aside>';
    $this->assertEquals($expected, $output, 'Should transform right-aligned callout box with basic text content');
  }

  /**
   * Tests left-aligned callout box with linked heading.
   *
   * @Covers::transform
   */
  public function testCalloutBox4(): void {
    $input = '<div class="callout-box-left" data-html-transformer="callout-box-left">
      <h3><a href="https://directorsblog.nih.gov/2024/06/27/molecular-portrait-of-key-driver-of-pancreatic-cancer-offers-hope-for-continued-treatment-advances">Molecular Portrait of Key Driver of Pancreatic Cancer Offers Hope for Continued Treatment Advances</a></h3>
      <p>Researchers have established the most comprehensive molecular portrait yet of the workings of KRAS and how its many downstream impacts may influence outcomes for people with pancreatic cancer.</p>
    </div>';
    $output = $this->calloutBoxTransformer->transform($input);
    $expected = '<div class="cgdp-embed-media-wrapper" data-html-transformer="callout-box-left"><div class="align-left embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-summary-box__heading"><a href="https://directorsblog.nih.gov/2024/06/27/molecular-portrait-of-key-driver-of-pancreatic-cancer-offers-hope-for-continued-treatment-advances">Molecular Portrait of Key Driver of Pancreatic Cancer Offers Hope for Continued Treatment Advances</a></div><div class="usa-prose usa-summary-box__text"><p>Researchers have established the most comprehensive molecular portrait yet of the workings of KRAS and how its many downstream impacts may influence outcomes for people with pancreatic cancer.</p></div></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform left-aligned callout box with linked heading');
  }

  /**
   * Tests class="callout-box".
   *
   * @Covers::transform
   */
  public function testCalloutBox5(): void {
    $input = '<div class="callout-box" data-html-transformer="callout-box">
      <center>
        <p>
          <a href="https://public.govdelivery.com/accounts/USNIHNCI/subscriber/new?topic_id=USNIHNCI_223">Sign up to get stories like this and CCDI updates in your inbox</a>
        </p>
      </center>
    </div>';
    $output = $this->calloutBoxTransformer->transform($input);
    $expected = '<div class="cgdp-embed-media-wrapper" data-html-transformer="callout-box"><div class="align-center embedded-entity cgdp-embed-summary-box cgdp-embed-summary-box--small"><div class="usa-summary-box"><div class="usa-summary-box__body"><div class="usa-prose usa-summary-box__text"><center>
        <p>
          <a href="https://public.govdelivery.com/accounts/USNIHNCI/subscriber/new?topic_id=USNIHNCI_223">Sign up to get stories like this and CCDI updates in your inbox</a>
        </p>
      </center></div></div></div></div></div>';
    $this->assertEquals($expected, $output, 'Should transform standard callout box with medium size by default');
  }

}
