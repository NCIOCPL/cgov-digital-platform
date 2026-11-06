<?php

namespace Drupal\cgov_migration;

/**
 * Converts a PDQ Drug Information Summary XML document to migration values.
 */
class DrugSummaryXmlParser {

  /**
   * Maximum length of the page description field.
   */
  private const DESCRIPTION_MAX = 600;

  /**
   * Parses a PDQ DIS XML file.
   *
   * @throws \InvalidArgumentException
   *   Thrown when the XML cannot be read or is not a DIS document.
   */
  public function parseFile(string $path): array {
    $xml = @file_get_contents($path);
    if ($xml === FALSE) {
      throw new \InvalidArgumentException("Unable to read PDQ DIS XML file $path.");
    }
    return $this->parse($xml, $path);
  }

  /**
   * Parses a PDQ DIS XML document.
   *
   * @throws \InvalidArgumentException
   *   Thrown when the XML is invalid or required source values are absent.
   */
  public function parse(string $xml, string $source = 'XML input'): array {
    $document = new \DOMDocument();
    $previous = libxml_use_internal_errors(TRUE);
    $loaded = $document->loadXML($xml, LIBXML_NONET | LIBXML_NOBLANKS);
    $errors = libxml_get_errors();
    libxml_clear_errors();
    libxml_use_internal_errors($previous);
    if (!$loaded || $document->documentElement?->tagName !== 'DrugInformationSummary') {
      $message = $errors ? trim($errors[0]->message) : 'Unexpected root element';
      throw new \InvalidArgumentException("Invalid PDQ DIS document in $source: $message.");
    }

    $xpath = new \DOMXPath($document);
    $cdr_id = $this->extractCdrId($document->documentElement->getAttribute('id'));
    $title = $this->text($xpath, '/DrugInformationSummary/DrugInfoTitle');
    $description = $this->text($xpath, '/DrugInformationSummary/DrugInfoMetaData/DrugInfoDescription');
    $url = $this->attribute($xpath, '/DrugInformationSummary/DrugInfoMetaData/DrugInfoURL', 'xref');
    if (!$cdr_id || $title === '' || $url === '') {
      throw new \InvalidArgumentException("Missing CDR ID, title, or URL in $source.");
    }

    $path = parse_url($url, PHP_URL_PATH);
    $parts = is_string($path) ? explode('/', trim($path, '/')) : [];
    $pretty_url = array_pop($parts);
    if (!$pretty_url || !$parts) {
      throw new \InvalidArgumentException("Invalid DrugInfoURL '$url' in $source.");
    }

    $type = $xpath->evaluate(
      'string(/DrugInformationSummary/DrugInfoMetaData/DrugInfoType/@Combination)'
    ) === 'Yes' ? 'combo' : 'single';

    $audio_ref = $this->attribute(
      $xpath,
      '/DrugInformationSummary/DrugInfoMetaData/PronunciationInfo/MediaLink[@type="audio/mpeg" and @language="en"][1]',
      'ref'
    );

    $values = [
      'cdr_id' => $cdr_id,
      'title' => $title,
      'description' => mb_substr($description, 0, self::DESCRIPTION_MAX),
      'site_section_path' => '/' . implode('/', $parts),
      'pretty_url' => $pretty_url,
      'pronunciation' => $this->text($xpath, '/DrugInformationSummary/DrugInfoMetaData/PronunciationInfo/TermPronunciation'),
      'audio_id' => $this->extractCdrId($audio_ref),
      'intro_text' => '<p>' . $this->escape($description) . '</p>',
      'drug_info_type' => $type,
      'us_brand_names' => $type === 'single' ? $this->getUsBrandNames($xpath) : [],
      'drugs_in_combination' => $type === 'combo' ? $this->buildDrugsInCombination($xpath) : '',
      'fda_url' => $type === 'single' ? $this->attribute(
        $xpath,
        '/DrugInformationSummary/DrugInfoMetaData/FDAExternalRef',
        'xref'
      ) : '',
      'body_sections' => [],
      'related_resources' => [],
      'posted_date' => $this->text($xpath, '/DrugInformationSummary/DateFirstPublished'),
      'updated_date' => $this->text($xpath, '/DrugInformationSummary/DateLastModified'),
      'date_display_mode' => ['posted', 'updated'],
      'public_use' => 0,
    ];

    /** @var \DOMElement $section */
    foreach ($xpath->query('/DrugInformationSummary/Section[Title]') as $section) {
      $heading = $this->normalize($xpath->evaluate('string(Title)', $section));
      if (strcasecmp($heading, 'Research Results and Related Resources') === 0) {
        /** @var \DOMElement $link */
        foreach ($xpath->query('.//ExternalRef[@xref]', $section) as $link) {
          $values['related_resources'][] = [
            'title' => $this->normalize($link->textContent),
            'url' => $link->getAttribute('xref'),
          ];
        }
        continue;
      }

      $content = '';
      foreach ($section->childNodes as $child) {
        if ($child instanceof \DOMElement && $child->tagName === 'Title') {
          continue;
        }
        $content .= $this->render($child);
      }
      $values['body_sections'][] = [
        'heading' => $heading,
        'content' => trim($content),
      ];
    }

    return $values;
  }

  /**
   * Gets the US brand names for a single drug.
   */
  private function getUsBrandNames(\DOMXPath $xpath): array {
    $values = [];
    foreach ($xpath->query('/DrugInformationSummary/DrugInfoMetaData/USBrandNames/USBrandName') as $name) {
      $value = $this->normalize($name->textContent);
      if ($value !== '') {
        $values[] = $value;
      }
    }
    return $values;
  }

  /**
   * Builds the NCIDS streamlined combination-drug list.
   */
  private function buildDrugsInCombination(\DOMXPath $xpath): string {
    $table = $xpath->query('/DrugInformationSummary/Section/Table[1]')->item(0);
    if (!$table instanceof \DOMElement) {
      return '';
    }

    $items = '';
    /** @var \DOMElement $row */
    foreach ($xpath->query('.//Row', $table) as $row) {
      $cells = $xpath->query('./entry', $row);
      if ($cells->length < 2) {
        continue;
      }
      $letter = $this->normalize($cells->item(0)->textContent);
      $drug = trim($this->renderChildren($cells->item(1)));
      $drug = preg_replace('/^\s*=\s*/', '', $drug) ?? $drug;
      $items .= '<li><strong>' . $this->escape($letter) . '</strong> = ' . $drug . '</li>';
    }
    return $items === '' ? '' : '<ul class="usa-list usa-list--unstyled">' . $items . '</ul>';
  }

  /**
   * Renders a supported DIS XML node as NCIDS WYSIWYG HTML.
   */
  private function render(\DOMNode $node): string {
    if ($node instanceof \DOMText) {
      return $this->escape($node->nodeValue ?? '');
    }
    if (!$node instanceof \DOMElement) {
      return '';
    }

    $content = $this->renderChildren($node);
    $id = $node->hasAttribute('id')
      ? ' id="' . $this->escape($node->getAttribute('id')) . '"'
      : '';
    return match ($node->tagName) {
      'Para' => "<p$id>$content</p>",
      'ItemizedList' => "<ul$id>$content</ul>",
      'ListItem' => "<li>$content</li>",
      'Strong' => "<strong>$content</strong>",
      'Emphasis' => "<em>$content</em>",
      'GeneName' => "<em class=\"gene-name\">$content</em>",
      'Superscript' => "<span class=\"sup\">$content</span>",
      'GlossaryTermRef' => $this->renderDefinition($node, $content),
      'DrugRef' => $this->renderLink($node->getAttribute('url'), $content),
      'ExternalRef' => $this->renderLink($node->getAttribute('xref'), $content),
      'Table' => '<table>' . $content . '</table>',
      'Title' => '<caption>' . $content . '</caption>',
      'TBody' => '<tbody>' . $content . '</tbody>',
      'Row' => '<tr>' . $content . '</tr>',
      'entry' => '<td>' . $content . '</td>',
      'TGroup', 'ColSpec' => $content,
      default => $content,
    };
  }

  /**
   * Renders all child nodes of an XML element.
   */
  private function renderChildren(\DOMNode $node): string {
    $html = '';
    foreach ($node->childNodes as $child) {
      $html .= $this->render($child);
    }
    return $html;
  }

  /**
   * Renders a glossary reference using the NCIDS definition element.
   */
  private function renderDefinition(\DOMElement $node, string $content): string {
    $id = $this->extractCdrId($node->getAttribute('href'));
    $dictionary = $node->getAttribute('dictionary') ?: 'Cancer.gov';
    $audience = $node->getAttribute('audience') ?: 'Patient';
    return sprintf(
      '<nci-definition data-gloss-id="%s" data-gloss-dictionary="%s" data-gloss-audience="%s" data-gloss-lang="en">%s</nci-definition>',
      $this->escape($id),
      $this->escape($dictionary),
      $this->escape($audience),
      $content
    );
  }

  /**
   * Renders an XML reference as an HTML link.
   */
  private function renderLink(string $url, string $content): string {
    return '<a href="' . $this->escape($url) . '">' . $content . '</a>';
  }

  /**
   * Gets normalized text for an XPath expression.
   */
  private function text(\DOMXPath $xpath, string $expression): string {
    return $this->normalize((string) $xpath->evaluate("string($expression)"));
  }

  /**
   * Gets an attribute from the first element matching an XPath expression.
   */
  private function attribute(\DOMXPath $xpath, string $expression, string $attribute): string {
    $node = $xpath->query($expression)->item(0);
    return $node instanceof \DOMElement ? $node->getAttribute($attribute) : '';
  }

  /**
   * Removes the CDR prefix and leading zeroes from an identifier.
   */
  private function extractCdrId(string $value): string {
    $digits = preg_replace('/\D/', '', $value) ?? '';
    return $digits === '' ? '' : (string) (int) $digits;
  }

  /**
   * Collapses XML formatting whitespace.
   */
  private function normalize(string $value): string {
    return trim(preg_replace('/\s+/u', ' ', $value) ?? '');
  }

  /**
   * Escapes a value for HTML text or attributes.
   */
  private function escape(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5, 'UTF-8');
  }

}
