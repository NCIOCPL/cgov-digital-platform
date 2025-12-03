<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer for tables.
 */
class NcidsTableTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected $transformerManager;

  /**
   * {@inheritdoc}
   */
  protected static $preprocessElements = [
    'table',
  ];

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    'table-default',
    'complex-table',
  ];

  /**
   * Constructor.
   *
   * @param \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager $transformer_manager
   *   The transformer manager service.
   */
  public function __construct(NcidsHtmlTransformerManager $transformer_manager) {
    $this->transformerManager = $transformer_manager;
  }

  /**
   * Get the HTML transformer manager service.
   *
   * @return \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
   *   The transformer manager service.
   */
  protected function getTransformerManager() {
    return $this->transformerManager;
  }

  /**
   * Helper to insert child html.
   *
   * @param \DOMDocument $dom
   *   The DOMDocument instance.
   * @param \DOMElement $elem
   *   The DOMElement to insert into.
   * @param string $html
   *   The HTML string to insert.
   */
  private function insertChildHtml(\DOMDocument $dom, \DOMElement $elem, string $html): void {
    // Parse the pullquote HTML and import nodes.
    $tmp_dom = Html::load($html);
    $body_elems = $tmp_dom->getElementsByTagName('body');

    // Make sure the loaded DOM is not empty.
    if (!$body_elems || $body_elems->length < 1 || !$body_elems->item(0)->hasChildNodes()) {
      return;
    }

    foreach ($body_elems->item(0)->childNodes as $node) {
      $imported_node = $dom->importNode($node, TRUE);
      $elem->appendChild($imported_node);
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

    // Find all callout boxes with data-html-transformer.
    $ncids_tables = $xpath->query("//*[@data-html-transformer='{$this->getShortName()}']");

    foreach ($ncids_tables as $ncids_table) {
      /** @var \DOMElement $ncids_table */
      $transformed_table = $dom->createElement('table');

      // Check the table for data-sortable or 'complex-table'
      // class to determine if table is sortable.
      $table_classes = preg_split('/\s+/', trim($ncids_table->getAttribute('class')));
      if (
        $ncids_table->hasAttribute('data-sortable') ||
        in_array('complex-table', $table_classes, TRUE)
      ) {
        $transformed_table->setAttribute('data-sortable', '');
      }

      // Go through table children to add them to transformed table
      // and add sortable attributes where necessary.
      foreach ($ncids_table->childNodes as $child) {
        /** @var \DOMElement $child */
        // If the child is a <thead>, go through its children
        // to add the sortable attributes to the table headers.
        if ($child->tagName === 'thead') {
          // Create a new <thead> element.
          $new_thead = $dom->createElement('thead');
          // Get the table row with the headers.
          $header_row = $child->childNodes[$child->tagName === 'tr'];
          $new_header_row = $dom->createElement('tr');

          // Go through the headers of the table to determine sortability.
          foreach ($header_row->childNodes as $table_header) {
            /** @var \DOMElement $table_header */
            if ($table_header->tagName === 'th') {
              $new_header = $dom->createElement('th');
              // Check for attributes such as scope and tabIndex
              // to preserve those values.
              if ($table_header->hasAttribute('tabIndex')) {
                $new_header->setAttribute('tabIndex', $table_header->getAttribute('tabIndex'));
              }
              if ($table_header->hasAttribute('scope')) {
                $new_header->setAttribute('scope', $table_header->getAttribute('scope'));
              }
              // If the header has the attribute to not be sorted
              // add the data-fixed attribute.
              if ($table_header->hasAttribute('data-fixed')) {
                $new_header->setAttribute('data-fixed', '');
              }
              $this->insertChildHtml($dom, $new_header, $table_header->textContent);
              $new_header_row->appendChild($new_header);
            }
            else {
              // If the element in the <thead> isn't a <th>, move on.
              continue;
            }
          }
          $new_thead->appendChild($new_header_row);
          $transformed_table->appendChild($new_thead);
        }
        else {
          // Add the child to the new table.
          $transformed_table->appendChild($child);
        }
      }

      $transformed_table->setAttribute('class', 'usa-table');
      $ncids_table->parentNode->replaceChild($transformed_table, $ncids_table);
    }

    return Html::serialize($dom);
  }

  /**
   * Get the inner HTML of a DOM element.
   *
   * @param \DOMElement $element
   *   The DOM element.
   *
   * @return string
   *   The inner HTML.
   */
  protected function getInnerHtml(\DOMElement $element): string {
    $inner_html = '';
    foreach ($element->childNodes as $child) {
      $inner_html .= $element->ownerDocument->saveHTML($child);
    }
    return $inner_html;
  }

}
