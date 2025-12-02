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
   */
  public function transform(string $html): string {
    if (empty(trim($html))) {
      return $html;
    }

    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    // Find all callout boxes with data-html-transformer.
    $callout_boxes = $xpath->query("//*[@data-html-transformer='NcidsCalloutBoxTransformer']");

    foreach ($callout_boxes as $callout_box) {
      /** @var \DOMElement $callout_box */
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
      $heading_html = '';
      $heading_element = NULL;

      // Find the first heading element in document order.
      foreach ($callout_box->childNodes as $child) {
        if ($child->nodeType === XML_ELEMENT_NODE) {
          $tag_name = strtolower($child->nodeName);
          if (in_array($tag_name, ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])) {
            $heading_element = $child;
            // Get inner HTML of heading.
            $heading_html = $this->getInnerHtml($heading_element);
            break;
          }
        }
      }

      // Get all content except the topmost heading.
      // All other headings will be treated as content.
      $content_html = '';
      $found_first_heading = FALSE;
      foreach ($callout_box->childNodes as $child) {
        if ($child === $heading_element && !$found_first_heading) {
          // Skip the topmost heading element.
          $found_first_heading = TRUE;
          continue;
        }
        $content_html .= $dom->saveHTML($child);
      }

      // Trim leading/trailing whitespace from content HTML.
      $content_html = trim($content_html);
      // Transform the content HTML through all transformers if available.
      $transformer_manager = $this->getTransformerManager();
      if (!empty($content_html)) {
        $content_html = $transformer_manager->transformAll($content_html);
      }

      // Build the new summary box structure.
      $wrapper_classes = trim("embedded-entity cgdp-embed-summary-box {$size_class}");
      if (!empty($alignment_class)) {
        $wrapper_classes = trim("{$alignment_class} {$wrapper_classes}");
      }

      $summary_box_html = '<div class="' . $wrapper_classes . '">';
      $summary_box_html .= '<div class="usa-summary-box">';
      $summary_box_html .= '<div class="usa-summary-box__body">';

      // Add heading if present.
      if (!empty($heading_html)) {
        $summary_box_html .= '<div class="usa-summary-box__heading">' . $heading_html . '</div>';
      }

      // Add content.
      $summary_box_html .= '<div class="usa-prose usa-summary-box__text">' . $content_html . '</div>';

      $summary_box_html .= '</div>';
      $summary_box_html .= '</div>';
      $summary_box_html .= '</div>';

      // Create a new wrapper element to replace the callout box.
      $new_wrapper = $dom->createElement($callout_box->nodeName);
      $new_wrapper->setAttribute('class', 'cgdp-embed-media-wrapper');
      $new_wrapper->setAttribute('data-html-transformer', 'NcidsCalloutBoxTransformer');

      // Parse the summary box HTML and import nodes.
      $temp_dom = Html::load($summary_box_html);
      $temp_xpath = new \DOMXPath($temp_dom);
      $imported_nodes = $temp_xpath->query('//body/*');

      foreach ($imported_nodes as $node) {
        $imported_node = $dom->importNode($node, TRUE);
        $new_wrapper->appendChild($imported_node);
      }

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
