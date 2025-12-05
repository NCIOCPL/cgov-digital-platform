<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer for callout boxes.
 */
class NcidsCalloutBoxTransformer extends NcidsHtmlTransformerBase {

  /**
   * The HTML transformer manager service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
   */
  protected $transformerManager;

  /**
   * {@inheritdoc}
   *
   * The classes this transformer looks to transform.
   */
  protected static $preprocessClasses = [
    'callout-box',
    'callout-box-left',
    'callout-box-right',
    'callout-box-center',
    'callout-box-full',
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
   * Get the HTML transformer manager service.
   *
   * @return \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
   *   The transformer manager service.
   */
  protected function getTransformerManager() {
    return $this->transformerManager;
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
    $callout_boxes = $xpath->query("//*[@data-html-transformer='{$this->getShortName()}']");

    foreach ($callout_boxes as $callout_box) {
      /** @var \DOMElement $callout_box */
      // Get callout box classes to determine alignment and size classes.
      $class_string = trim($callout_box->getAttribute('class'));
      $class_array = preg_split('/\s+/', $class_string);
      $callout_box_type = array_find($class_array, function (string $class_name) {
        return in_array($class_name, static::$preprocessClasses);
      });

      // Determine alignment and size based on transformer type.
      $alignment_class = '';
      $size_class = 'cgdp-embed-summary-box--full';

      switch ($callout_box_type) {
        case 'callout-box-left':
          $alignment_class = 'align-left';
          $size_class = 'cgdp-embed-summary-box--small';
          break;

        case 'callout-box-right':
          $alignment_class = 'align-right';
          $size_class = 'cgdp-embed-summary-box--small';
          break;

        case 'callout-box-center':
          $alignment_class = 'align-center';
          $size_class = 'cgdp-embed-summary-box--full';
          break;

        case 'callout-box':
          $alignment_class = 'align-center';
          $size_class = 'cgdp-embed-summary-box--small';
          break;
      }

      // Extract the topmost heading (h1-h6) if present.
      $heading_html_string = '';

      // Find the first heading element in document order.
      foreach ($callout_box->childNodes as $child) {
        /** @var \DOMElement $child */
        // If the node is a comment, continue looping.
        if ($child->nodeType === XML_COMMENT_NODE) {
          continue;
        }
        elseif ($child->nodeType === XML_TEXT_NODE && empty(trim($child->textContent))) {
          continue;
        }
        elseif (
          $child->nodeType !== XML_ELEMENT_NODE ||
          !in_array($child->nodeName, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        ) {
          break;
        }
        else {
          // Get inner HTML of heading.
          $heading_html_string = $this->getInnerHtml($child);
          $child->setAttribute("data-heading", 'true');
          break;
        }
      }

      // Get all content except the topmost heading.
      // All other headings will be treated as content.
      $content_html_string = '';
      foreach ($callout_box->childNodes as $child) {
        /** @var \DOMElement $child */
        if ($child->nodeType === XML_ELEMENT_NODE && $child->hasAttribute("data-heading")) {
          // Skip the topmost heading element.
          continue;
        }
        $content_html_string .= $dom->saveHTML($child);
      }

      // Trim leading/trailing whitespace from content HTML.
      $content_html_string = trim($content_html_string);
      // Transform the content HTML through all transformers if available.
      $transformer_manager = $this->getTransformerManager();
      if (!empty($content_html_string)) {
        $content_html_string = $transformer_manager->transformAll($content_html_string);
      }

      // Build the new summary box structure.
      $wrapper_classes = trim("embedded-entity cgdp-embed-summary-box {$size_class}");
      if (!empty($alignment_class)) {
        $wrapper_classes = trim("{$alignment_class} {$wrapper_classes}");
      }

      // Create a new wrapper element to replace the callout box.
      $new_wrapper = $dom->createElement('div');
      $new_wrapper->setAttribute('class', 'cgdp-embed-media-wrapper');
      $new_wrapper->setAttribute('data-html-transformer', $this->getShortName());

      // Creates Embedded Entity Element.
      $embedded_entity = $dom->createElement('div');
      $embedded_entity->setAttribute('class', $wrapper_classes);
      $new_wrapper->appendChild($embedded_entity);

      // Creates Summary Box Element.
      $summary_box = $dom->createElement($callout_box->nodeName);
      $summary_box->setAttribute('class', 'usa-summary-box');
      $embedded_entity->appendChild($summary_box);

      // Creates Summary Box Body Element.
      $summary_box_body = $dom->createElement('div');
      $summary_box_body->setAttribute('class', 'usa-summary-box__body');
      $summary_box->appendChild($summary_box_body);

      // Add heading if present.
      if (!empty($heading_html_string)) {
        // Creates Summary Box Heading Element.
        $summary_box_heading = $dom->createElement('div');
        $summary_box_heading->setAttribute('class', 'usa-summary-box__heading');
        $this->insertChildHtml($dom, $summary_box_heading, $heading_html_string);
        $summary_box_body->appendChild($summary_box_heading);
      }

      $summary_box_content = $dom->createElement('div');
      $summary_box_content->setAttribute('class', 'usa-prose usa-summary-box__text');
      $this->insertChildHtml($dom, $summary_box_content, $content_html_string);
      $summary_box_body->appendChild($summary_box_content);

      // Replace the original callout box with the new wrapper.
      $callout_box->parentNode->replaceChild($new_wrapper, $callout_box);
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
