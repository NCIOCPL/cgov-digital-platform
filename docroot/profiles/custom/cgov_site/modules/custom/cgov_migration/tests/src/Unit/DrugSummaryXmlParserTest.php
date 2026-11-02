<?php

namespace Drupal\Tests\cgov_migration\Unit;

use Drupal\cgov_migration\DrugSummaryXmlParser;
use Drupal\Tests\UnitTestCase;

/**
 * Tests conversion of PDQ DIS XML into migration values.
 *
 * @group cgov_migration
 */
class DrugSummaryXmlParserTest extends UnitTestCase {

  /**
   * Tests the single-drug field and section mappings.
   */
  public function testSingleDrug(): void {
    $xml = <<<'XML'
<DrugInformationSummary id="CDR0000487488">
  <DrugInfoMetaData>
    <DrugInfoType>Brief</DrugInfoType>
    <DrugInfoDescription>A brief description.</DrugInfoDescription>
    <DrugInfoURL xref="https://www.cancer.gov/about-cancer/treatment/drugs/imatinibmesylate">Imatinib Mesylate</DrugInfoURL>
    <USBrandNames><USBrandName>Gleevec</USBrandName><USBrandName>Imkeldi</USBrandName></USBrandNames>
    <PronunciationInfo>
      <TermPronunciation>ih-MA-tih-nib MEH-zih-layt</TermPronunciation>
      <MediaLink ref="CDR0000706105" type="audio/mpeg" language="en"/>
    </PronunciationInfo>
    <FDAExternalRef xref="https://example.org/label">FDA label information</FDAExternalRef>
  </DrugInfoMetaData>
  <DrugInfoTitle>Imatinib Mesylate</DrugInfoTitle>
  <Section id="_1">
    <Title>Use in Cancer</Title>
    <Para id="_2"><Strong><GlossaryTermRef href="CDR0000045586" dictionary="Cancer.gov" audience="Patient">Leukemia</GlossaryTermRef></Strong> content.</Para>
  </Section>
  <Section id="_Research">
    <Title>Research Results and Related Resources</Title>
    <Para><ExternalRef xref="https://example.org/resource">A resource</ExternalRef></Para>
  </Section>
  <Section id="_Trial">
    <Title>Clinical Trials Accepting Patients</Title>
    <Para>Trial content.</Para>
  </Section>
  <DrugInfoDisclaimer><Para><Strong>Important:</Strong> Do not migrate.</Para></DrugInfoDisclaimer>
  <DateFirstPublished>2006-10-05</DateFirstPublished>
  <DateLastModified>2025-01-09</DateLastModified>
</DrugInformationSummary>
XML;

    $values = (new DrugSummaryXmlParser())->parse($xml);

    $this->assertSame('487488', $values['cdr_id']);
    $this->assertSame('Imatinib Mesylate', $values['title']);
    $this->assertSame('/about-cancer/treatment/drugs', $values['site_section_path']);
    $this->assertSame('imatinibmesylate', $values['pretty_url']);
    $this->assertSame('single', $values['drug_info_type']);
    $this->assertSame('706105', $values['audio_id']);
    $this->assertSame(['Gleevec', 'Imkeldi'], $values['us_brand_names']);
    $this->assertSame('', $values['drugs_in_combination']);
    $this->assertSame('https://example.org/label', $values['fda_url']);
    $this->assertSame('<p>A brief description.</p>', $values['intro_text']);
    $this->assertSame(['Use in Cancer', 'Clinical Trials Accepting Patients'], array_column($values['body_sections'], 'heading'));
    $this->assertStringContainsString('data-gloss-id="45586"', $values['body_sections'][0]['content']);
    $this->assertStringNotContainsString('Do not migrate', $values['body_sections'][1]['content']);
    $this->assertSame([
      ['title' => 'A resource', 'url' => 'https://example.org/resource'],
    ], $values['related_resources']);
    $this->assertSame('2006-10-05', $values['posted_date']);
    $this->assertSame('2025-01-09', $values['updated_date']);
    $this->assertSame(['posted', 'updated'], $values['date_display_mode']);
    $this->assertSame(0, $values['public_use']);
  }

  /**
   * Tests conversion of a combination table to its dedicated field.
   */
  public function testCombinationDrug(): void {
    $xml = <<<'XML'
<DrugInformationSummary id="CDR0000630806">
  <DrugInfoMetaData>
    <DrugInfoType Combination="Yes">Brief</DrugInfoType>
    <DrugInfoDescription>Combination description.</DrugInfoDescription>
    <DrugInfoURL xref="https://www.cancer.gov/about-cancer/treatment/drugs/AC-T">AC-T</DrugInfoURL>
  </DrugInfoMetaData>
  <DrugInfoTitle>AC-T</DrugInfoTitle>
  <Section><Table><Title>Drugs in the AC-T combination:</Title><TGroup><TBody>
    <Row><entry><Strong>A</Strong></entry><entry>= <DrugRef url="/drug/a">Drug A</DrugRef></entry></Row>
  </TBody></TGroup></Table><Para>FDA combination sentence.</Para></Section>
  <Section><Title>Use in Cancer</Title><Para>Body content.</Para></Section>
  <DrugInfoDisclaimer><Para>Disclaimer.</Para></DrugInfoDisclaimer>
  <DateFirstPublished>2009-09-18</DateFirstPublished>
  <DateLastModified>2023-05-10</DateLastModified>
</DrugInformationSummary>
XML;

    $values = (new DrugSummaryXmlParser())->parse($xml);

    $this->assertSame('combo', $values['drug_info_type']);
    $this->assertSame([], $values['us_brand_names']);
    $this->assertSame('', $values['fda_url']);
    $this->assertStringContainsString(
      '<li><strong>A</strong> = <a href="/drug/a">Drug A</a></li>',
      $values['drugs_in_combination']
    );
    $this->assertSame('<p>Combination description.</p>', $values['intro_text']);
    $this->assertStringNotContainsString('FDA combination sentence', $values['drugs_in_combination']);
    $this->assertCount(1, $values['body_sections']);
  }

}
