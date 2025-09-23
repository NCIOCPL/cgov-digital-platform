<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transforms HTML by removing disallowed attributes.
 */
class NcidsDisallowedAttributesTransformer extends NcidsHtmlTransformerBase {

  /**
   * Allowed attributes by element (excluding 'id' and 'class').
   *
   * @var array
   */
  protected array $allowedAttributes = [
    'a' => [
      'target',
      'href',
      'data-entity-type',
      'data-entity-uuid',
      'data-entity-substitution',
      'onclick',
    ],
    'iframe' => [
      'allow',
      'allowfullscreen',
      'frameborder',
      'height',
      'marginheight',
      'marginwidth',
      'mozallowfullscreen',
      'msallowfullscreen',
      'name',
      'oallowfullscreen',
      'scrolling',
      'src',
      'title',
      'webkitallowfullscreen',
      'width',
    ],
    'nci-definition' => [
      'data-gloss-audience',
      'data-gloss-dictionary',
      'data-gloss-id',
      'data-gloss-lang',
    ],
    'ol' => ['start', 'type'],
    'script' => ['src', 'type'],
    'time' => ['datetime'],
    'img' => ['alt', 'src', 'srcset', 'height', 'width', 'loading', 'name'],
  ];

  /**
   * Elements that should be skipped entirely from attributes processing.
   *
   * @var array
   */
  protected array $skipElements = ['td', 'th', 'tr', 'table'];

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    if (empty($html)) {
      return $html;
    }

    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    // Process all elements with attributes.
    $elements = $xpath->query('//*[@*]');
    if ($elements) {
      foreach ($elements as $element) {
        /** @var \DOMElement $element */
        if ($this->shouldSkipElement($element)) {
          continue;
        }
        $this->processElementAttributes($element);
      }
    }

    $html = Html::serialize($dom);

    /* Remove xmlns namespace declarations */
    $html = preg_replace('/\s+xmlns:[a-zA-Z0-9_-]+="[^"]*"/', '', $html);

    /* Restore empty alt attributes that may have been stripped */
    $html = preg_replace('/(<img[^>]*?\salt)(?=[\s>\/])/', '$1=""', $html);

    return $html;
  }

  /**
   * Processes element attributes according to allowed combinations.
   *
   * @param \DOMElement $element
   *   The DOM element to process.
   */
  protected function processElementAttributes(\DOMElement $element): void {
    $tagName = strtolower($element->tagName);

    /* Skip table elements (td, th) entirely */
    if (in_array($tagName, $this->skipElements)) {
      return;
    }

    /* Get all attributes for this element */
    $attributes = [];
    foreach ($element->attributes as $attr) {
      $attributes[] = $attr->nodeName;
    }

    /* All elements are allowed to contain id and class */
    $allowedForElement = ['id', 'class'];

    /* Add element-specific allowed attributes */
    if (isset($this->allowedAttributes[$tagName])) {
      $allowedForElement = array_merge($allowedForElement, $this->allowedAttributes[$tagName]);
    }

    /* Remove disallowed attributes */
    foreach ($attributes as $attributeName) {
      if (!in_array($attributeName, $allowedForElement)) {
        $element->removeAttribute($attributeName);
      }
    }
  }

}
