<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer for pullquotes.
 */
class NcidsPullquoteTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessClasses = [
    // Based on content analysis all pullquote instances have pullquote class
    // regardless of alignment.
    'pullquote',
  ];

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
    $transformer_manager = $this->getTransformerManager();

    // Find all pullquotes with data-html-transformer.
    $pullquotes = $xpath->query("//*[@data-html-transformer='{$this->getShortName()}']");

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
        // Transform the pullquote text through all transformers if available.
        if (!empty($pullquote_text)) {
          $pullquote_text = $transformer_manager->transformAll($pullquote_text);
        }
      }

      // Extract author.
      $author_text = '';
      $author_elements = $xpath->query(".//p[@class='author']", $pullquote);
      if ($author_elements->length > 0) {
        $author_text = $this->getInnerHtml($author_elements->item(0));
      }

      $new_pullquote_element = $this->getNewPullquoteHtml(
        $dom,
        $size_class,
        $alignment_class,
        $author_text,
        $pullquote_text,
      );

      // Replace the original pullquote with the new wrapper.
      $pullquote->parentNode->replaceChild($new_pullquote_element, $pullquote);
    }

    return Html::serialize($dom);
  }

  /**
   * Helper to create new pullquote.
   *
   * @param \DOMDocument $dom
   *   An instance of a DOM.
   * @param string $size_class
   *   The Size class.
   * @param string $alignment_class
   *   The Alignment class. (This can be an empty string.)
   * @param string $author_text
   *   The string of the HTML contents of the author portion.
   * @param string $pullquote_text
   *   The string of the HTML contents of the text portion.
   *
   * @return \DOMElement
   *   An HTML element representing the pullquote.
   */
  private function getNewPullquoteHtml(
    \DOMDocument $dom,
    string $size_class,
    string $alignment_class,
    string $author_text,
    string $pullquote_text,
  ): \DOMElement {
    // This is the new element to replace the pull quote with.
    $new_media_wrap = $dom->createElement('div');
    $new_media_wrap->setAttribute('class', 'cgdp-embed-media-wrapper');
    $new_media_wrap->setAttribute('data-html-transformer', $this->getShortName());

    // This is embedded-entity wrapper that holds the pull quote.
    $new_embed = $dom->createElement('div');
    $embed_class_array = [
      'embedded-entity',
      'cgdp-embed-pullquote',
      $size_class,
    ];
    if (!empty($alignment_class)) {
      $embed_class_array[] = $alignment_class;
    }
    $new_embed->setAttribute('class', implode(' ', $embed_class_array));
    $new_media_wrap->appendChild($new_embed);

    $pullquote_block = $dom->createElement('div');
    $pullquote_block->setAttribute('class', 'cgdp-pullquote');
    $new_embed->appendChild($pullquote_block);

    $pullquote_container = $dom->createElement('div');
    $pullquote_container->setAttribute('class', 'cgdp-pullquote__container');
    $pullquote_block->appendChild($pullquote_container);

    // Add pullquote body.
    if (!empty($pullquote_text)) {
      $text_el = $dom->createElement('p');
      $text_el->setAttribute('class', 'cgdp-pullquote__body');
      $this->insertChildHtml($dom, $text_el, $pullquote_text);
      $pullquote_container->appendChild($text_el);
    }

    // Add author if present.
    if (!empty($author_text)) {
      $author_el = $dom->createElement('p');
      $author_el->setAttribute('class', 'cgdp-pullquote__author');
      $this->insertChildHtml($dom, $author_el, $author_text);
      $pullquote_container->appendChild($author_el);
    }

    return $new_media_wrap;
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

  /**
   * Get the short name of this transformer class.
   *
   * @return string
   *   The short class name.
   */
  private function getShortName(): string {
    $parts = explode('\\', get_class($this));
    return end($parts);
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

}
