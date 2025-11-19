<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer for pullquotes into NCIDS pullquotes.
 */
class NcidsPullquoteTransformer extends NcidsHtmlTransformerBase {

  /**
   * The HTML transformer manager service.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerManager
   */
  protected $transformerManager;

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

    // Find all pullquotes with data-html-transformer.
    $pullquotes = $xpath->query("//*[@data-html-transformer='pullquote']");

    foreach ($pullquotes as $pullquote) {
      /** @var \DOMElement $pullquote */

      // Determine alignment and size based on classes.
      $existing_classes = $pullquote->getAttribute('class');
      $alignment_class = '';
      $size_class = 'cgdp-embed-pullquote--full';

      if (strpos($existing_classes, 'pullquote-left') !== FALSE) {
        $alignment_class = 'align-left';
        $size_class = 'cgdp-embed-pullquote--small';
      }
      elseif (strpos($existing_classes, 'pullquote-right') !== FALSE) {
        $alignment_class = 'align-right';
        $size_class = 'cgdp-embed-pullquote--small';
      }
      elseif (strpos($existing_classes, 'pullquote-center') !== FALSE) {
        $alignment_class = 'align-center';
        $size_class = 'cgdp-embed-pullquote--small';
      }

      // Extract pullquote text.
      $pullquote_text = '';
      $text_elements = $xpath->query(".//p[@class='pullquote-text']", $pullquote);
      if ($text_elements->length > 0) {
        $pullquote_text = $this->getInnerHtml($text_elements->item(0));
      }

      // Extract author.
      $author_text = '';
      $author_elements = $xpath->query(".//p[@class='author']", $pullquote);
      if ($author_elements->length > 0) {
        $author_text = $this->getInnerHtml($author_elements->item(0));
      }

      // Transform the pullquote text through all transformers if available.
      $transformer_manager = $this->getTransformerManager();
      if (!empty($pullquote_text)) {
        $pullquote_text = $transformer_manager->transformAll($pullquote_text);
      }

      // Build the new pullquote structure.
      $wrapper_classes = trim("embedded-entity cgdp-embed-pullquote {$size_class}");
      if (!empty($alignment_class)) {
        $wrapper_classes = trim("{$alignment_class} {$wrapper_classes}");
      }

      $pullquote_html = '<div class="' . $wrapper_classes . '">';
      $pullquote_html .= '<div class="cgdp-pullquote">';
      $pullquote_html .= '<div class="cgdp-pullquote__container">';

      // Add pullquote body.
      if (!empty($pullquote_text)) {
        $pullquote_html .= '<p class="cgdp-pullquote__body">' . $pullquote_text . '</p>';
      }

      // Add author if present.
      if (!empty($author_text)) {
        $pullquote_html .= '<p class="cgdp-pullquote__author">' . $author_text . '</p>';
      }

      $pullquote_html .= '</div>';
      $pullquote_html .= '</div>';
      $pullquote_html .= '</div>';

      // Create a new wrapper element to replace the pullquote.
      $new_wrapper = $dom->createElement('div');
      $new_wrapper->setAttribute('class', 'cgdp-embed-media-wrapper');
      $new_wrapper->setAttribute('data-html-transformer', 'pullquote');

      // Parse the pullquote HTML and import nodes.
      $temp_dom = Html::load($pullquote_html);
      $temp_xpath = new \DOMXPath($temp_dom);
      $imported_nodes = $temp_xpath->query('//body/*');

      foreach ($imported_nodes as $node) {
        $imported_node = $dom->importNode($node, TRUE);
        $new_wrapper->appendChild($imported_node);
      }

      // Replace the original pullquote with the new wrapper.
      $pullquote->parentNode->replaceChild($new_wrapper, $pullquote);
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
