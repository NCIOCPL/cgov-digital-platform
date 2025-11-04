<?php

namespace Drupal\cgov_core\Plugin\Filter;

use Drupal\Component\Utility\Html;
use Drupal\filter\FilterProcessResult;
use Drupal\filter\Plugin\FilterBase;

/**
 * Provides a filter to add USA classes to tables.
 *
 * @Filter(
 *   id = "cgov_table_class_filter",
 *   title = @Translation("Add USA Table Classes"),
 *   description = @Translation("Automatically adds usa-table class to tables and wraps them in scrollable containers."),
 *   type = Drupal\filter\Plugin\FilterInterface::TYPE_TRANSFORM_REVERSIBLE,
 *   weight = -10,
 * )
 */
class TableClassFilter extends FilterBase {

  /**
   * {@inheritdoc}
   */
  public function process($text, $langcode) {
    if (strpos($text, '<table') === FALSE) {
      return new FilterProcessResult($text);
    }
    $dom = Html::load($text);
    $xpath = new \DOMXpath($dom);
    $tables = $xpath->query('//table');

    foreach ($tables as $table) {
      /** @var \DOMElement $table */
      /** @var \DOMElement $parent */
      $parent = $table->parentNode;
      if ($parent && $parent->tagName === 'div' &&
          strpos($parent->getAttribute('class'), 'usa-table-container--scrollable') !== FALSE) {
        continue;
      }

      // Add usa-table class to the table.
      $existingClass = $table->getAttribute('class');
      $classes = array_filter(explode(' ', $existingClass));

      // Add usa-table class if not already present.
      if (!in_array('usa-table', $classes)) {
        $classes[] = 'usa-table';
        $table->setAttribute('class', implode(' ', $classes));
      }

      // Create wrapper div.
      $wrapper = $dom->createElement('div');
      $wrapper->setAttribute('class', 'usa-table-container--scrollable');

      // Insert wrapper before table.
      $table->parentNode->insertBefore($wrapper, $table);

      // Move table into wrapper.
      $wrapper->appendChild($table);
    }

    $result = Html::serialize($dom);

    return new FilterProcessResult($result);
  }

}
