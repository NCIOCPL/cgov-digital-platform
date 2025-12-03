<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsDefinitionTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Ncids Definition Transformer Service.
 *
 * @group ncids_html_transformer
 * @coversDefaultClass \Drupal\ncids_html_transformer\Services\NcidsDefinitionTransformer
 */
class NcidsDefinitionTransformerTest extends UnitTestCase {

  /**
   * The transformer service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsDefinitionTransformer
   */
  protected $transformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->transformer = new NcidsDefinitionTransformer();
  }

  /**
   * Tests conversion of PDQ HP genetics definition link.
   *
   * @covers ::transform
   */
  public function testConvertPdqHpGeneticsDefinitionLink() {
    $input = '<a class="definition" type="GlossaryTermRefs" href="/Common/PopUps/popDefinition.aspx?id=339347&amp;version=healthprofessional&amp;language=English&amp;dictionary=genetic" onclick="javascript:popWindow(\'defbyid\',\'CDR0000339347&amp;version=healthprofessional&amp;language=English&amp;dictionary=genetic\'); return(false);">sporadic</a>';
    $output = $this->transformer->transform($input);
    $expected = '<nci-definition data-gloss-id="339347" data-gloss-dictionary="Genetics" data-gloss-audience="Health Professional" data-gloss-lang="en">sporadic</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single definition with PDQ structure mess.');
  }

  /**
   * Tests conversion of external definition link.
   *
   * @covers ::transform
   */
  public function testConvertLinkExternalLink() {
    $input = '<a class="definition" href="https://www.cancer.gov/Common/PopUps/popDefinition.aspx?id=CDR0000348989&version=Patient&amp;language=English" onclick="javascript:popWindow(\'defbyid\',\'CDR0000348989&amp;version=Patient&amp;language=English\'); return false;">case-control studies</a>';

    $output = $this->transformer->transform($input);

    $expected = '<nci-definition data-gloss-id="348989" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">case-control studies</nci-definition>';
    $this->assertEquals($expected, $output, 'This should convert a external link that has the parameters we need.');
  }

  /**
   * Tests that links with invalid href patterns are not converted.
   *
   * @covers ::transform
   */
  public function testConvertLinkBadHref() {
    $input = '<a class="definition" href="/dictionary?expand=e#esophagus" onclick="javascript:popWindow(\'definition\',\'esophagus\'); return false;">esophagus</a>';

    $output = $this->transformer->transform($input);

    $expected = '<a class="definition" href="/dictionary?expand=e#esophagus" onclick="javascript:popWindow(\'definition\',\'esophagus\'); return false;">esophagus</a>';
    $this->assertEquals($expected, $output, 'This should convert a link whose href doesn\'t match our known patterns.');
  }

  /**
   * Tests that links with bad encoding are not converted.
   *
   * @covers ::transform
   */
  public function testConvertLinkBadEncoding() {
    $input = '<a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000348989#38;version=Patient&amp;language=English" onclick="javascript:popWindow(\'defbyid\',\'CDR0000348989&amp;version=Patient&amp;language=English\'); return false;">case-control studies</a>';

    $output = $this->transformer->transform($input);

    $expected = '<a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000348989#38;version=Patient&amp;language=English" onclick="javascript:popWindow(\'defbyid\',\'CDR0000348989&amp;version=Patient&amp;language=English\'); return false;">case-control studies</a>';
    $this->assertEquals($expected, $output, 'This should convert a link that has bad encoding for &.');
  }

  /**
   * Tests conversion of old definition link format.
   *
   * @covers ::transform
   */
  public function testConvertOldOldDefinitionLink() {
    $input = '<a class="definition" onclick="javascript:popWindow(\'defbyid\',\'CDR0000730354&amp;version=Patient&amp;language=English\'); return false;" href="/Common/PopUps/popDefinition.aspx?id=CDR0000730354&amp;version=Patient&amp;language=English">Meditation</a>';
    $output = $this->transformer->transform($input);
    $expected = '<nci-definition data-gloss-id="730354" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">Meditation</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * Tests conversion of old definition link with data-glossary-id attribute.
   *
   * @covers ::transform
   */
  public function testConvertOldDefinitionLink() {
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>';
    $output = $this->transformer->transform($input);
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * Tests conversion of definition link with 'en' language code.
   *
   * @covers ::transform
   */
  public function testConvertOldEnDefinitionLink() {
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=en">chemotherapy</a>';
    $output = $this->transformer->transform($input);
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * Tests conversion of Spanish definition link.
   *
   * @covers ::transform
   */
  public function testConvertOldSpanishDefinitionLink() {
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=Spanish">chemotherapy</a>';
    $output = $this->transformer->transform($input);
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="es">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * Tests conversion of definition link with 'es' language code.
   *
   * @covers ::transform
   */
  public function testConvertOldEsDefinitionLink() {
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=es">chemotherapy</a>';
    $output = $this->transformer->transform($input);
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="es">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * Tests conversion of two definition links separated by non-breaking space.
   *
   * @covers ::transform
   */
  public function testConvertTwoLinksSeparatedByNbsp() {
    $input = '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>' .
        '&nbsp;' .
        '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>';
    $output = $this->transformer->transform($input);
    $expected = '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>' .
        '&nbsp;' .
        '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>';

    $this->assertEquals($expected, $output, 'This should convert a single data-glossary-id.');
  }

  /**
   * Tests conversion of a definition link followed by HTML content.
   *
   * @covers ::transform
   */
  public function testConvertLinkFollowedByHtml() {
    $input = '<p><a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>' .
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>';

    $output = $this->transformer->transform($input);
    $expected = '<p><nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>' .
        'Lorem ipsum dolor sit amet consectetur adipiscing elit.</p>';
    $this->assertEquals($expected, $output, 'This should convert a link followed by html.');
  }

  /**
   * Tests conversion of HTML content followed by a definition link.
   *
   * @covers ::transform
   */
  public function testConvertHtmlFollowedByLink() {
    $input = '<p>Lorem ipsum dolor sit amet consectetur adipiscing elit.' .
        '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a></p>';

    $output = $this->transformer->transform($input);
    $expected = '<p>Lorem ipsum dolor sit amet consectetur adipiscing elit.' .
        '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition></p>';
    $this->assertEquals($expected, $output, 'This should convert a link that is preceeded by html.');
  }

  /**
   * Tests conversion of a definition link inside a list item.
   *
   * @covers ::transform
   */
  public function testConvertLinkInList() {
    $input = '<ul><li>Lorem ipsum dolor sit amet consectetur adipiscing elit.' .
        '<a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English">chemotherapy</a>' .
        'Dolor sit amet consectetur adipiscing elit quisque faucibus.</li>' .
        '<li>Lorem ipsum dolor sit amet consectetur adipiscing elit.</li></ul>';

    $output = $this->transformer->transform($input);

    $expected = '<ul><li>Lorem ipsum dolor sit amet consectetur adipiscing elit.' .
        '<nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en">chemotherapy</nci-definition>' .
        'Dolor sit amet consectetur adipiscing elit quisque faucibus.</li>' .
        '<li>Lorem ipsum dolor sit amet consectetur adipiscing elit.</li></ul>';
    $this->assertEquals($expected, $output, 'This should convert a link that is in a list with text.');
  }

  /**
   * Tests conversion of definition link with bold and italics.
   *
   * @covers ::transform
   */
  public function testConvertLinkBoldItalics() {
    $input = '<p><a class="definition" data-glossary-id="CDR0000045214" href="/Common/PopUps/popDefinition.aspx?id=CDR0000045214&amp;version=Patient&amp;language=English"><strong><em>chemotherapy</em></strong></a></p>';

    $output = $this->transformer->transform($input);

    $expected = '<p><nci-definition data-gloss-id="45214" data-gloss-dictionary="Cancer.gov" data-gloss-audience="Patient" data-gloss-lang="en"><strong><em>chemotherapy</em></strong></nci-definition></p>';
    $this->assertEquals($expected, $output, 'This should convert a link that is bold and italics.');
  }

}
