<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer for tables.
 */
class NcidsTableTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   *
   * This includes table attributes that are removed.
   * Includes random attributes we've found on tables during page inventory.
   * (s, td, bb, etc are not valid attributes on anything...)
   */
  protected static $ignoreAttributes = [
    'data-sorted',
    'data-sort-value',
    'cellspacing',
    'title',
    'bb',
    'headers',
    's',
    'td',
  ];

  /**
   * {@inheritdoc}
   *
   * Attributes to convert to styles on table elements.
   */
  protected static $attributesToConvertToStyles = [
    'width',
    'height',
    'border',
    'border-style',
    'border-color',
    'border-width',
    'text-align',
    'vertical-align',
    'background-color',
    'padding',
  ];

  /**
   * {@inheritdoc}
   *
   * Get all table elements for processing.
   */
  private function getAllTableElementsForCheck(\DOMElement $table): array {
    // Build a list of elements to process: the table itself plus
    // any descendant table, tr, th, and td elements.
    $elements = [$table];
    foreach (['table', 'tr', 'th', 'td'] as $tag) {
      $nodeList = $table->getElementsByTagName($tag);
      foreach ($nodeList as $node) {
        if ($node instanceof \DOMElement) {
          $elements[] = $node;
        }
      }
    }
    return $elements;
  }

  /**
   * {@inheritdoc}
   *
   * Convert designated attributes to inline styles.
   */
  private function convertAttributesToStyles(\DOMElement $el): \DOMElement {
    foreach (self::$attributesToConvertToStyles as $attribute) {
      // If the attribute exists on the element, convert it to a style.
      if ($el->hasAttribute($attribute)) {
        $style_value = $el->getAttribute($attribute);
        $existing_style = $el->getAttribute('style');
        $new_style = $existing_style ? rtrim($existing_style, ';') . '; ' : '';
        if ($attribute === 'border') {
          if (is_numeric($style_value)) {
            if (intval($style_value) > 0) {
              $new_style .= 'border: ' . $style_value . 'px solid black;';
            }
          }
          else {
            $new_style .= 'border: ' . $style_value . ';';
          }
        }
        else {
          $new_style .= $attribute . ': ' . $style_value . ';';
        }
        if (!empty($new_style)) {
          $el->setAttribute('style', $new_style);
        }
        $el->removeAttribute($attribute);
      }
    }
    return $el;
  }

  /**
   * {@inheritdoc}
   *
   * Handle sortable attributes and update them appropriately.
   */
  private function removeIgnoreAttributes(\DOMElement $el): \DOMElement {
    foreach ($el->attributes as $attr) {
      /** @var \DOMAttr $attr */
      if (in_array($attr->name, self::$ignoreAttributes)) {
        // If the attribute is a table header, convert to aria-sort.
        // This handles if the table is pre-sorted. (not sure if any are...)
        if ($el->tagName === 'th' && $attr->name === 'data-sorted') {
          $sort_value = $el->getAttribute('data-sorted');
          $aria_sort_value = 'none';
          if ($sort_value === 'up') {
            $aria_sort_value = 'ascending';
          }
          elseif ($sort_value === 'down') {
            $aria_sort_value = 'descending';
          }
          $el->setAttribute('aria-sort', $aria_sort_value);
        }
        // If the attribute is a table cell, convert to data-sort-active.
        elseif ($el->tagName === 'td' && $attr->name === 'data-sorted') {
          $is_sorted = $el->getAttribute('data-sorted');
          if ($is_sorted === 'true') {
            // Add data-sort-active attribute to indicate active sorted column.
            $el->setAttribute('data-sort-active', '');
          }
        }
        // Remove invalid sortable attributes.
        $el->removeAttribute($attr->name);
      }
    }
    return $el;
  }

  /**
   * {@inheritdoc}
   *
   * Transform the HTML attributes.
   */
  private function handleAllAttributes(array $elements): void {
    // For each element, convert any of the configured attributes
    // to inline styles and retain any data-sortable attribute.
    // Remove other attributes.
    foreach ($elements as $el) {
      /** @var \DOMElement $el */
      $el = $this->convertAttributesToStyles($el);
      $this->removeIgnoreAttributes($el);
    }
  }

  /**
   * {@inheritdoc}
   *
   * Transform the HTML.
   */
  public function transform(string $html): string {
    if (empty(trim($html))) {
      return $html;
    }

    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    // Find all tables.
    $all_tables = $xpath->query("//table");
    $elements_to_check = [];

    foreach ($all_tables as $table) {
      /** @var \DOMElement $table */
      // Check if the table is sortable.
      if ($table->hasAttribute('data-sortable')) {
        // Add the usa-table class if not already present
        // for sortable table logic. (Javascript looks for this class.)
        $table->setAttribute('class', 'usa-table');
      }
      // If the table isn't sortable, it should not have any classes.
      else {
        $table->removeAttribute('class');
      }

      // Build a list of elements to process: the table itself plus
      // any descendant table, tr, th, and td elements.
      $elements_to_check = array_merge($elements_to_check, $this->getAllTableElementsForCheck($table));
    }

    $this->handleAllAttributes($elements_to_check);

    return Html::serialize($dom);
  }

}
