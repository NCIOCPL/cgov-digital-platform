<?php

namespace Drupal\Tests\ncids_html_transformer\Unit;

use Drupal\ncids_html_transformer\Services\NcidsDisallowedAttributesTransformer;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Basic Migration Transformer Service.
 *
 * @group ncids_html_transformer
 */
class AttributesMigrationTransformerTest extends UnitTestCase {

  /**
   * The disallowed attributes transformer.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsDisallowedAttributesTransformer
   */
  protected $attributesTransformer;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    // Create the disallowed attributes transformer.
    $this->attributesTransformer = new NcidsDisallowedAttributesTransformer();
  }

  /**
   * Tests ID attribute preservation on all elements.
   *
   * @Covers::transform
   */
  public function testIdAttributePreservation(): void {
    $input = '<div id="test-div" data-custom="remove">Content <span id="inner-span">Text</span> <p id="paragraph" onclick="alert()">Para</p></div>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<div id="test-div">Content <span id="inner-span">Text</span> <p id="paragraph">Para</p></div>';
    $this->assertEquals($expected, $output, 'Should preserve ID attributes on all elements while removing other disallowed attributes');
  }

  /**
   * Tests anchor target attribute preservation.
   *
   * @Covers::transform
   */
  public function testAnchorTargetAttribute(): void {
    $input = '<a href="#" target="_blank" onclick="alert()" data-custom="remove" id="link">Link</a>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<a href="#" target="_blank" onclick="alert()" id="link">Link</a>';
    $this->assertEquals($expected, $output, 'Should preserve target and id attributes on anchor elements while removing others');
  }

  /**
   * Tests iframe attribute preservation.
   *
   * @Covers::transform
   */
  public function testIframeAttributes(): void {
    $input = '<iframe src="https://example.com" width="500" height="300" allowfullscreen frameborder="0" title="Example" onclick="alert()" data-custom="remove" id="video">Content</iframe>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<iframe src="https://example.com" width="500" height="300" allowfullscreen frameborder="0" title="Example" id="video">Content</iframe>';
    $this->assertEquals($expected, $output, 'Should preserve allowed iframe attributes while removing disallowed ones');
  }

  /**
   * Tests nci-definition custom element attributes.
   *
   * @Covers::transform
   */
  public function testNciDefinitionAttributes(): void {
    $input = '<nci-definition data-gloss-id="123" data-gloss-audience="patient" data-gloss-dictionary="cancer" data-gloss-lang="en" onclick="alert()" data-custom="remove" id="definition">Term</nci-definition>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<nci-definition data-gloss-id="123" data-gloss-audience="patient" data-gloss-dictionary="cancer" data-gloss-lang="en" id="definition">Term</nci-definition>';
    $this->assertEquals($expected, $output, 'Should preserve allowed data attributes and id on nci-definition elements');
  }

  /**
   * Tests ordered list start and type attributes.
   *
   * @Covers::transform
   */
  public function testOrderedListAttributes(): void {
    $input = '<ol start="5" type="I" data-custom="remove" id="list"><li>Item 1</li><li>Item 2</li></ol>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<ol start="5" type="I" id="list"><li>Item 1</li><li>Item 2</li></ol>';
    $this->assertEquals($expected, $output, 'Should preserve start, type, and id attributes on ordered lists');
  }

  /**
   * Tests script element attributes.
   *
   * @Covers::transform
   */
  public function testScriptAttributes(): void {
    $input = '<script src="script.js" type="text/javascript" data-custom="remove" onclick="alert()" id="my-script">console.log("test");</script>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<script src="script.js" type="text/javascript" id="my-script">console.log("test");</script>';
    $this->assertEquals($expected, $output, 'Should preserve src, type, and id attributes on script elements');
  }

  /**
   * Tests time element datetime attribute.
   *
   * @Covers::transform
   */
  public function testTimeAttributes(): void {
    $input = '<time datetime="2024-01-15T10:30:00Z" data-custom="remove" id="timestamp">January 15, 2024</time>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<time datetime="2024-01-15T10:30:00Z" id="timestamp">January 15, 2024</time>';
    $this->assertEquals($expected, $output, 'Should preserve datetime and id attributes on time elements');
  }

  /**
   * Tests elements not in allowed list get only id attribute.
   *
   * @Covers::transform
   */
  public function testUnlistedElementsOnlyKeepId(): void {
    $input = '<section data-custom="remove" onclick="alert()" id="section">Content <article data-test="remove" id="article">Article</article></section>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<section id="section">Content <article id="article">Article</article></section>';
    $this->assertEquals($expected, $output, 'Should only preserve id attribute on elements not in the allowed attributes list');
  }

  /**
   * Tests empty attributes are properly removed.
   *
   * @Covers::transform
   */
  public function testEmptyAttributeRemoval(): void {
    $input = '<div data-empty="" id="test" onclick="">Content</div>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<div id="test">Content</div>';
    $this->assertEquals($expected, $output, 'Should remove empty attributes while preserving id');
  }

  /**
   * Tests complex nested structure with mixed allowed/disallowed attributes.
   *
   * @Covers::transform
   */
  public function testComplexNestedAttributeStructure(): void {
    $input = '<div id="container" class="grid-container">
      <ol start="1" type="A" id="list" onclick="alert()">
        <li id="item1">
          <a href="#" target="_blank" id="link" class="usa-button" data-custom="remove">
            <time datetime="2024-01-01" id="time">Date</time>
          </a>
        </li>
      </ol>
    </div>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<div id="container" class="grid-container">
      <ol start="1" type="A" id="list">
        <li id="item1">
          <a href="#" target="_blank" id="link" class="usa-button">
            <time datetime="2024-01-01" id="time">Date</time>
          </a>
        </li>
      </ol>
    </div>';
    $this->assertEquals($expected, $output, 'Should correctly handle complex nested structure with various attribute rules');
  }

  /**
   * Tests data-html-transformer attribute prevents processing.
   *
   * @Covers::transform
   */
  public function testDataHtmlTransformerSkipping(): void {
    $input = '<div data-html-transformer="skip" class="invalid" style="color: red;" onclick="alert()">
      <p class="bad" style="font-size: large;" data-custom="remove">Nested content</p>
      <span class="wrong" onclick="alert()">More content</span>
    </div>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<div data-html-transformer="skip" class="invalid" style="color: red;" onclick="alert()">
      <p class="bad" style="font-size: large;" data-custom="remove">Nested content</p>
      <span class="wrong" onclick="alert()">More content</span>
    </div>';
    $this->assertEquals($expected, $output, 'Should skip processing elements with data-html-transformer attribute and their children');
  }

  /**
   * Tests all iframe attributes are preserved.
   *
   * @Covers::transform
   */
  public function testAllIframeAttributes(): void {
    $input = '<iframe
      id="test-iframe"
      allow="fullscreen"
      allowfullscreen
      frameborder="1"
      height="400"
      marginheight="10"
      marginwidth="15"
      mozallowfullscreen
      msallowfullscreen
      name="test-frame"
      oallowfullscreen
      scrolling="no"
      src="https://example.com"
      title="Test Frame"
      webkitallowfullscreen
      width="600"
      onclick="alert()"
      data-custom="remove">
    </iframe>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<iframe id="test-iframe" allow="fullscreen" allowfullscreen frameborder="1" height="400" marginheight="10" marginwidth="15" mozallowfullscreen msallowfullscreen name="test-frame" oallowfullscreen scrolling="no" src="https://example.com" title="Test Frame" webkitallowfullscreen width="600">
    </iframe>';
    $this->assertEquals($expected, $output, 'Should preserve all allowed iframe attributes while removing disallowed ones');
  }

  /**
   * Tests anchor tag attributes.
   *
   * @Covers::transform
   */
  public function testAnchorTagAttributes(): void {
    $input = '<a href="#" target="_blank" data-entity-type="good" data-entity-uuid="good" data-entity-substitution="good" data-test-attribute="bad">testing</a>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<a href="#" target="_blank" data-entity-type="good" data-entity-uuid="good" data-entity-substitution="good">testing</a>';
    $this->assertEquals($expected, $output, 'Should remove unwanted attributes from anchor tags');
  }

  /**
   * Tests img tag attributes.
   *
   * @Covers::transform
   */
  public function testImgTagAttributes(): void {
    $input = '<img loading="lazy" src="/sites/default/files/oembed_thumbnails/Lm2zgXog0O-iIvL1prniHay9UfMfF-6WT8uO4bEgUSM.jpg" width="480" height="360" alt="">';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<img loading="lazy" src="/sites/default/files/oembed_thumbnails/Lm2zgXog0O-iIvL1prniHay9UfMfF-6WT8uO4bEgUSM.jpg" width="480" height="360" alt="">';
    $this->assertEquals($expected, $output, 'Should remove unwanted attributes from anchor tags');
  }

  /**
   * Tests div tags.
   *
   * @Covers::transform
   */
  public function testDivTagAttributes(): void {
    $input = '<div xmlns:o="urn:www.microsoft.com/office" xmlns:st1="urn:www.microsoft.com/smarttags" xmlns:st2="urn:www.microsoft.com/smarttags2" xmlns:w="urn:www.microsoft.com/word" xmlns:x="urn:www.microsoft.com/excel">
      <p>Cancers of the head and neck can form in the:&nbsp;</p>
      <p><strong>Oral cavity:</strong> Includes the lips, the front two-thirds of the tongue, the gums, the lining inside the cheeks and lips, the floor (bottom) of the mouth under the tongue, the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000389462&amp;version=Patient&amp;language=en">hard palate</a> (bony top of the mouth), and the small area of the gum behind the wisdom teeth.</p>
      <p><strong>Throat (pharynx):</strong> The pharynx is a hollow tube about 5 inches long that starts behind the nose and leads to the esophagus. It has three parts: the <strong><a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046025&amp;version=Patient&amp;language=en">nasopharynx</a></strong> (the upper part of the pharynx, behind the nose); the <strong><a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046024&amp;version=Patient&amp;language=en">oropharynx</a></strong> (the middle part of the pharynx, including the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000389466&amp;version=Patient&amp;language=en">soft palate</a> [the back of the mouth], the base of the tongue, and the tonsils); the <strong><a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046029&amp;version=Patient&amp;language=en">hypopharynx</a></strong> (the lower part of the pharynx).</p>
      <p><strong>Voice box (larynx):</strong> The voice box is a short passageway formed by cartilage just below the pharynx in the neck. The voice box contains the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046650&amp;version=Patient&amp;language=en">vocal cords</a>. It also has a small piece of tissue, called the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046421&amp;version=Patient&amp;language=en">epiglottis</a>, which moves to cover the voice box to prevent food from entering the air passages.</p>
      <p><strong>Paranasal sinuses and nasal cavity:</strong> The paranasal sinuses are small hollow spaces in the bones of the head surrounding the nose. The nasal cavity is the hollow space inside the nose.</p>
      <p><strong>Salivary glands:</strong> The major salivary glands are in the floor of the mouth and near the jawbone. The salivary glands produce saliva. Minor salivary glands are located throughout the mucous membranes of the mouth and throat.</p>
      <p>&nbsp;</p>
    </div>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<div>
      <p>Cancers of the head and neck can form in the:&nbsp;</p>
      <p><strong>Oral cavity:</strong> Includes the lips, the front two-thirds of the tongue, the gums, the lining inside the cheeks and lips, the floor (bottom) of the mouth under the tongue, the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000389462&amp;version=Patient&amp;language=en">hard palate</a> (bony top of the mouth), and the small area of the gum behind the wisdom teeth.</p>
      <p><strong>Throat (pharynx):</strong> The pharynx is a hollow tube about 5 inches long that starts behind the nose and leads to the esophagus. It has three parts: the <strong><a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046025&amp;version=Patient&amp;language=en">nasopharynx</a></strong> (the upper part of the pharynx, behind the nose); the <strong><a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046024&amp;version=Patient&amp;language=en">oropharynx</a></strong> (the middle part of the pharynx, including the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000389466&amp;version=Patient&amp;language=en">soft palate</a> [the back of the mouth], the base of the tongue, and the tonsils); the <strong><a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046029&amp;version=Patient&amp;language=en">hypopharynx</a></strong> (the lower part of the pharynx).</p>
      <p><strong>Voice box (larynx):</strong> The voice box is a short passageway formed by cartilage just below the pharynx in the neck. The voice box contains the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046650&amp;version=Patient&amp;language=en">vocal cords</a>. It also has a small piece of tissue, called the <a class="definition" href="/Common/PopUps/popDefinition.aspx?id=CDR0000046421&amp;version=Patient&amp;language=en">epiglottis</a>, which moves to cover the voice box to prevent food from entering the air passages.</p>
      <p><strong>Paranasal sinuses and nasal cavity:</strong> The paranasal sinuses are small hollow spaces in the bones of the head surrounding the nose. The nasal cavity is the hollow space inside the nose.</p>
      <p><strong>Salivary glands:</strong> The major salivary glands are in the floor of the mouth and near the jawbone. The salivary glands produce saliva. Minor salivary glands are located throughout the mucous membranes of the mouth and throat.</p>
      <p>&nbsp;</p>
    </div>';
    $this->assertEquals($expected, $output, 'Should remove unwanted attributes from div tags while keeping allowed ones');
  }

  /**
   * Tests img tag attributes.
   *
   * @Covers::transform
   */
  public function testRandomAttributes(): void {
    $input = '<p><strong>Acerca de los Institutos Nacionales de la Salud:</strong>&nbsp;Los Institutos Nacionales de la Salud (NIH) son el organismo nacional de investigación médica, integrado por 27 institutos y centros, y es un componente del Departamento de Salud y Servicios Humanos de los Estados Unidos (HHS). Los NIH son el organismo federal principal que lleva a cabo y apoya la investigación básica, clínica y médica aplicada e investiga las causas, los tratamientos y las curas de enfermedades comunes y raras. Para obtener más información sobre los NIH y sus programas, visite <a href="https://salud.nih.gov/">salud.nih.gov</a>.<w:sdtpr></w:sdtpr><w:sdt id="1213311133" sdttag="goog_rdk_31"></w:sdt></p>';
    $output = $this->attributesTransformer->transform($input);
    $expected = '<p><strong>Acerca de los Institutos Nacionales de la Salud:</strong>&nbsp;Los Institutos Nacionales de la Salud (NIH) son el organismo nacional de investigación médica, integrado por 27 institutos y centros, y es un componente del Departamento de Salud y Servicios Humanos de los Estados Unidos (HHS). Los NIH son el organismo federal principal que lleva a cabo y apoya la investigación básica, clínica y médica aplicada e investiga las causas, los tratamientos y las curas de enfermedades comunes y raras. Para obtener más información sobre los NIH y sus programas, visite <a href="https://salud.nih.gov/">salud.nih.gov</a>.<w:sdtpr></w:sdtpr><w:sdt id="1213311133"></w:sdt></p>';
    $this->assertEquals($expected, $output, 'Should remove unwanted attributes from w tags');
  }

}
