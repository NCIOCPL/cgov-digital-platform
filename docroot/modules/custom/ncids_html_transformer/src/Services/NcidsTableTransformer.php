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
      // @todo Need to preserve approved classes, styles, attributes
      // on the table element itself.
      // @todo Will likely also need something for scrollable tables
      // which is likely just wrapping this element in
      // something like <div class="usa-table--scrollable">.
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

      // Go through table children to transform them and
      // add them to transformed table.
      $table_children_html_string = '';
      foreach ($ncids_table->childNodes as $child) {
        /** @var \DOMElement $child */
        // Add table children to transformed content string.
        $table_children_html_string .= $dom->saveHTML($child);
      }
      $table_children_html_string = trim($table_children_html_string);

      // Transform the table children via transform manager.
      $transformer_manager = $this->getTransformerManager();
      if (!empty($table_children_html_string)) {
        $table_children_html_string = $transformer_manager->transformAll($table_children_html_string);
        $this->insertChildHtml($dom, $transformed_table, $table_children_html_string);
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
