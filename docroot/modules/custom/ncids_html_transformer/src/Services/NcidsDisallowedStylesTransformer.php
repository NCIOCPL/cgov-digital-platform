<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transforms HTML by removing disallowed styles.
 */
class NcidsDisallowedStylesTransformer extends NcidsHtmlTransformerBase {

  /**
   * Allowed styles for table elements.
   *
   * @var array
   */
  protected array $allowedTableStyles = [
    'background-color',
    'border',
    'border-color',
    'border-style',
    'border-width',
    'height',
    'padding',
    'text-align',
    'vertical-align',
    'width',
  ];

  /**
   * Table-related elements that can have specific allowed styles.
   *
   * @var array
   */
  protected array $tableElements = ['table', 'tbody', 'td', 'th', 'tr'];

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    if (empty($html)) {
      return $html;
    }

    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    /* Find ALL elements with style attributes */
    $elementsWithStyles = $xpath->query('//*[@style]');

    if ($elementsWithStyles) {
      foreach ($elementsWithStyles as $element) {
        /** @var \DOMElement $element */

        /* Skip elements that have data-html-transformer or are children of such elements */
        if ($this->shouldSkipElement($element)) {
          continue;
        }

        /* Check if this is a table-related element */
        if (in_array(strtolower($element->tagName), $this->tableElements)) {
          $this->processTableStyles($element);
        }
        else {
          $element->removeAttribute('style');
        }
      }
    }

    return Html::serialize($dom);
  }

  /**
   * Processes table element styles according to allowed styles.
   *
   * @param \DOMElement $element
   *   The DOM element to process.
   */
  protected function processTableStyles(\DOMElement $element): void {
    $styles = $this->parseStyles($element->getAttribute('style'));
    $cleanedStyles = [];

    foreach ($styles as $property => $value) {
      if (in_array($property, $this->allowedTableStyles)) {
        $cleanedStyles[$property] = $value;
      }
    }

    if (empty($cleanedStyles)) {
      $element->removeAttribute('style');
    }
    else {
      $element->setAttribute('style', $this->buildStyleString($cleanedStyles));
    }
  }

  /**
   * Parses style string into an associative array.
   *
   * @param string $styleString
   *   The style string to parse.
   *
   * @return array
   *   Associative array of style properties and values.
   */
  protected function parseStyles(string $styleString): array {
    $styles = [];
    $declarations = array_filter(explode(';', $styleString));

    foreach ($declarations as $declaration) {
      $parts = array_map('trim', explode(':', $declaration));
      if (count($parts) === 2) {
        $styles[trim($parts[0])] = trim($parts[1]);
      }
    }

    return $styles;
  }

  /**
   * Builds style string from associative array.
   *
   * @param array $styles
   *   Associative array of style properties and values.
   *
   * @return string
   *   The constructed style string.
   */
  protected function buildStyleString(array $styles): string {
    $parts = [];
    foreach ($styles as $property => $value) {
      $parts[] = "$property: " . rtrim($value, ';') . ";";
    }
    return implode(' ', $parts);
  }

}
