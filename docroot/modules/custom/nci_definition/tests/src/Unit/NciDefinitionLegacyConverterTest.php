<?php

namespace Drupal\nci_definition\tests\src\Unit;

use Drupal\nci_definition\Services\NciDefinitionLegacyConverter;
use PHPUnit\Framework\TestCase;

/**
 * @coversDefaultClass \Drupal\nci_definition\NciDefinitionLegacyConverter
 *
 * @group nci_definition
 */
class NciDefinitionLegacyConverterTest extends TestCase {

  /**
   * @covers ::convert
   */
  public function testConvertPdqHpGeneticsDefinitionLink() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" type="GlossaryTermRefs" href="/Common/PopUps/popDefinition.aspx?id=339347&amp;version=healthprofessional&amp;language=English&amp;dictionary=genetic" onclick="javascript:popWindow(\'defbyid\',\'CDR0000339347&amp;version=healthprofessional&amp;language=English&amp;dictionary=genetic\'); return(false);">sporadic</a>';
    $output = $converter->convert($input);
    // You are going to change this.
    $expected = '<nci-definition data-gloss-id="339347" data-gloss-dictionary="Genetics" data-gloss-audience="Health Professional" data-gloss-lang="en">sporadic</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single definition with PDQ structure mess.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertLinkExternalLink() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" href="https://www.cancer.gov/Common/PopUps/popDefinition.aspx?id=CDR0000348989&version=Patient&amp;language=English" onclick="javascript:popWindow(\'defbyid\',\'CDR0000348989&amp;version=Patient&amp;language=English\'); return false;">case-control studies</a>';

    $output = $converter->convert($input);

    $expected = '<nci-definition data-gloss-id="348989" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">case-control studies</nci-definition>';
    $this->assertEquals($expected, $output, 'This should convert a external link that has the parameters we need.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertLinkBadHref() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" href="/dictionary?expand=e#esophagus" onclick="javascript:popWindow(\'definition\',\'esophagus\'); return false;">esophagus</a>';

    $output = $converter->convert($input);

    $expected = '<a class="definition" href="/dictionary?expand=e#esophagus" onclick="javascript:popWindow(\'definition\',\'esophagus\'); return false;">esophagus</a>';
    $this->assertEquals($expected, $output, 'This should convert a link whose href doesn\'t match our known patterns.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertLinkBadEncoding() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000348989#38;version=Patient&amp;language=English" onclick="javascript:popWindow(\'defbyid\',\'CDR0000348989&amp;version=Patient&amp;language=English\'); return false;">case-control studies</a>';

    $output = $converter->convert($input);

    $expected = '<a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000348989#38;version=Patient&amp;language=English" onclick="javascript:popWindow(\'defbyid\',\'CDR0000348989&amp;version=Patient&amp;language=English\'); return false;">case-control studies</a>';
    $this->assertEquals($expected, $output, 'This should convert a link that has bad encoding for &.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertOldOldDefinitionLink() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" onclick="javascript:popWindow(\'defbyid\',\'CDR0000730354&amp;version=Patient&amp;language=English\'); return false;" href="/Common/PopUps/popDefinition.aspx?id=CDR0000730354&amp;version=Patient&amp;language=English">Meditation</a>';
    $output = $converter->convert($input);
    // You are going to change this.
    $expected = '<nci-definition data-gloss-id="730354" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">Meditation</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertOldDefinitionLink() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>';
    $output = $converter->convert($input);
    // You are going to change this.
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertOldEnDefinitionLink() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=en">chemotherapy</a>';
    $output = $converter->convert($input);
    // You are going to change this.
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertOldSpanishDefinitionLink() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=Spanish">chemotherapy</a>';
    $output = $converter->convert($input);
    // You are going to change this.
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="es">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertOldEsDefinitionLink() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=es">chemotherapy</a>';
    $output = $converter->convert($input);
    // You are going to change this.
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="es">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertTwoLinksSeparatedByNbsp() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>' .
        '&nbsp;' .
        '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>';
    $output = $converter->convert($input);
    // You are going to change this.
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>' .
        '&nbsp;' .
        '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertLinkFollowedByHtml() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<p><a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>' .
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>';

    $output = $converter->convert($input);

    $expected = '<p><nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>' .
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>';
    $this->assertEquals($expected, $output, 'This should convert a link followed by html.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertHtmlFollowedByLink() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<p>Lorem ipsum dolor sit amet consectetur adipiscing elit.' .
        '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a></p>';

    $output = $converter->convert($input);

    $expected = '<p>Lorem ipsum dolor sit amet consectetur adipiscing elit.' .
        '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition></p>';
    $this->assertEquals($expected, $output, 'This should convert a link that is preceeded by html.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertLinkInList() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<ul><li>Lorem ipsum dolor sit amet consectetur adipiscing elit.' .
        '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>' .
        'Dolor sit amet consectetur adipiscing elit quisque faucibus.</li>' .
        '<li>Lorem ipsum dolor sit amet consectetur adipiscing elit.</li></ul>';

    $output = $converter->convert($input);

    $expected = '<ul><li>Lorem ipsum dolor sit amet consectetur adipiscing elit.' .
        '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>' .
        'Dolor sit amet consectetur adipiscing elit quisque faucibus.</li>' .
        '<li>Lorem ipsum dolor sit amet consectetur adipiscing elit.</li></ul>';
    $this->assertEquals($expected, $output, 'This should convert a link that is in a list with text.');
  }

  /**
   * @covers ::convert
   */
  public function testConvertLinkBoldItalics() {
    $converter = new NciDefinitionLegacyConverter();
    $input = '<p><a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English"><strong><em>chemotherapy</em></strong></a></p>';

    $output = $converter->convert($input);

    $expected = '<p><nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en"><strong><em>chemotherapy</em></strong></nci-definition></p>';
    $this->assertEquals($expected, $output, 'This should convert a link that is bold and italics.');
  }

}
