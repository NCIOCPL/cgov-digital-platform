<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;
use Psr\Log\LoggerInterface;

/**
 * Transformer that unwraps unwanted wrapper elements and lifts children up.
 *
 * Uses a recursive tree-based approach to process the HTML structure,
 * unwrapping plain wrappers and wrapping orphaned content in paragraphs.
 */
class NcidsUnwrapTransformer extends NcidsHtmlTransformerBase {

  /**
   * Temporary attribute to mark paragraphs added by this transformer.
   */
  private const ADDED_P_MARKER = 'data-ncids-added-p';

  /**
   * Temporary attribute to mark paragraphs that should not be merged.
   */
  private const NOT_MERGEABLE_MARKER = 'data-not-mergeable';

  /**
   * Elements that should always be unwrapped.
   */
  private const ALWAYS_UNWRAP = ['center', 'o:p', 'g', 'pre', 'u', 'nonomasticon', 'small', 'font'];

  /**
   * Elements where text can be direct children (no paragraph wrapping needed).
   */
  private const TEXT_CONTAINER_ELEMENTS = [
    'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
    'drupal-entity',
  ];

  /**
   * Block-level elements that don't need paragraph wrapping.
   */
  private const BLOCK_ELEMENTS = [
    'p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
    'blockquote', 'section', 'article', 'header', 'footer',
    'drupal-entity',
  ];

  /**
   * Phrasing content elements (inline elements).
   *
   * Based on: https://developer.mozilla.org/en-US/docs/Web/HTML/Content_categories#phrasing_content
   * Note: 'u' and 'small' are excluded because they're in ALWAYS_UNWRAP.
   */
  private const PHRASING_ELEMENTS = [
    'a', 'abbr', 'area', 'audio', 'b', 'bdi', 'bdo', 'br', 'button', 'canvas',
    'cite', 'code', 'data', 'datalist', 'del', 'dfn', 'em', 'embed', 'i',
    'iframe', 'img', 'input', 'ins', 'kbd', 'label', 'link', 'map', 'mark',
    'math', 'meta', 'meter', 'noscript', 'object', 'output', 'picture',
    'progress', 'q', 'ruby', 's', 'samp', 'script', 'select', 'slot', 'span',
    'strong', 'sub', 'sup', 'svg', 'template', 'textarea', 'time',
    'var', 'video', 'wbr',
    // Custom elements.
    'nci-definition',
  ];

  /**
   * The logger interface service.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * Constructor.
   *
   * @param \Psr\Log\LoggerInterface $logger
   *   A logger instance.
   */
  public function __construct(LoggerInterface $logger) {
    $this->logger = $logger;
  }

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    if (empty(trim($html))) {
      return $html;
    }

    $dom = Html::load($html);
    $body = $dom->getElementsByTagName('body')->item(0);

    if (!$body) {
      return $html;
    }

    // Process the tree recursively (depth-first).
    $this->processBody($body);

    // Merge consecutive paragraphs that were added by this transformer.
    $this->mergeAddedParagraphs($body);

    // Clean up the marker attributes.
    $this->removeMarkerAttributes($dom);

    return Html::serialize($dom);
  }

  /**
   * Process the body element.
   */
  private function processBody(\DOMElement $body): void {
    // No need to process if body is empty or does not have children.
    if (!$body || !$body->hasChildNodes()) {
      return;
    }

    // Process each child and get back an array of nodes.
    $new_body_children = [];
    // Collect all children to process.
    $children = iterator_to_array($body->childNodes);
    foreach ($children as $child) {
      $processed = $this->processNode($child);
      if (is_array($processed) && count($processed) > 0) {
        foreach ($processed as $node) {
          $new_body_children[] = $node;
        }
      }
    }

    // Wrap any orphaned phrasing content in paragraphs.
    $new_body_children = $this->wrapOrphanedContent($new_body_children, $body);

    // Mark paragraphs that should not be merged.
    $this->markNonMergeableParagraphs($new_body_children);

    // Replace body's children with the processed children.
    // Remove all existing children.
    while ($body->firstChild) {
      $body->removeChild($body->firstChild);
    }

    // Add the new processed children.
    foreach ($new_body_children as $newChild) {
      $body->appendChild($newChild);
    }
  }

  /**
   * Process a node and its children recursively (depth-first).
   */
  private function processNode(\DOMNode $node): array {
    // Skip if this element should not be transformed.
    if ($node instanceof \DOMElement && $this->shouldSkipElement($node)) {
      return [$node];
    }
    /** @var \DOMElement $node */
    // Handle different node types.
    if ($node->nodeType === XML_COMMENT_NODE) {
      return [$node];
    }
    elseif ($node->nodeType === XML_TEXT_NODE) {
      // Return all text nodes, including whitespace-only.
      // Parent context will decide whether to keep or normalize.
      return [$node];
    }
    elseif ($node->nodeType === XML_ELEMENT_NODE) {
      return $this->processElement($node);
    }
    else {
      // Log unexpected node types.
      $this->logger->warning('Unexpected node type encountered: @type', ['@type' => $node->nodeType]);
      return [$node];
    }
  }

  /**
   * Process an element node and its children.
   *
   * @param \DOMElement $element
   *   The element to process.
   *
   * @return array
   *   Array of nodes to replace this element with.
   */
  private function processElement(\DOMElement $element): array {
    // Process each child.
    $new_children = [];
    // Collect all children to process.
    $children = iterator_to_array($element->childNodes);
    foreach ($children as $child) {
      $processed = $this->processNode($child);
      if (is_array($processed) && count($processed) > 0) {
        foreach ($processed as $node) {
          $new_children[] = $node;
        }
      }
    }

    // Wrap orphaned phrasing content unless this element is itself phrasing.
    // Anchors and other inline elements can contain text directly, so avoid
    // wrapping their children to prevent nested paragraphs inside phrasing tag.
    $tagName = strtolower($element->tagName);

    // Check if this element should be unwrapped.
    if ($this->shouldUnwrapElement($element)) {
      // Don't wrap orphaned content if this element will be unwrapped.
      // Its children will move to a different parent context.
      return $new_children;
    }

    // Only wrap orphaned content for elements that won't be unwrapped.
    if (!in_array($tagName, self::PHRASING_ELEMENTS)) {
      $new_children = $this->wrapOrphanedContent($new_children, $element);
      $this->markNonMergeableParagraphs($new_children);
    }

    // Keep the element - replace its children with processed children.
    while ($element->firstChild) {
      $element->removeChild($element->firstChild);
    }

    foreach ($new_children as $newChild) {
      $element->appendChild($newChild);
    }

    // Restructure anchors that contain block elements.
    if ($tagName === 'a' && $this->containsBlockElements($element)) {
      return $this->restructureAnchorWithBlocks($element);
    }

    return [$element];
  }

  /**
   * Determine if an element should be unwrapped.
   *
   * @param \DOMElement $element
   *   The element to check.
   *
   * @return bool
   *   TRUE if the element should be unwrapped.
   */
  private function shouldUnwrapElement(\DOMElement $element): bool {
    $tagName = strtolower($element->tagName);

    // Always unwrap these elements.
    if (in_array($tagName, self::ALWAYS_UNWRAP)) {
      return TRUE;
    }

    // Unwrap spans with no attributes.
    if ($tagName === 'span' && !$element->hasAttributes()) {
      return TRUE;
    }

    // Unwrap divs that directly contain drupal-entity.
    if ($tagName === 'div') {
      foreach ($element->childNodes as $child) {
        if ($child instanceof \DOMElement && strtolower($child->tagName) === 'drupal-entity' && $this->isPlainWrapper($element)) {
          return TRUE;
        }
      }

      // Unwrap plain divs (no class, no id).
      if ($this->isPlainWrapper($element)) {
        return TRUE;
      }
    }

    // Unwrap plain sections (no class, no id).
    if ($tagName === 'section' && $this->isPlainWrapper($element)) {
      return TRUE;
    }

    return FALSE;
  }

  /**
   * Determine if an element is a plain wrapper safe to unwrap.
   *
   * @param \DOMElement $element
   *   The element to check.
   *
   * @return bool
   *   TRUE if the element is a plain wrapper.
   */
  private function isPlainWrapper(\DOMElement $element): bool {
    // If element has an id attribute, it's identifiable/structural - keep it.
    if ($element->hasAttribute('id') && trim($element->getAttribute('id')) !== '') {
      return FALSE;
    }

    // If there is no class attribute or it's empty, treat as plain.
    if (!$element->hasAttribute('class') || trim($element->getAttribute('class')) === '') {
      return TRUE;
    }

    // Element has classes, so it's structural/meaningful - keep it.
    return FALSE;
  }

  /**
   * Check if an element contains block-level elements.
   *
   * @param \DOMElement $element
   *   The element to check.
   *
   * @return bool
   *   TRUE if the element contains block elements.
   */
  private function containsBlockElements(\DOMElement $element): bool {
    foreach ($element->childNodes as $child) {
      if ($child instanceof \DOMElement) {
        $childTag = strtolower($child->tagName);
        if (in_array($childTag, self::BLOCK_ELEMENTS)) {
          return TRUE;
        }
      }
    }
    return FALSE;
  }

  /**
   * Restructure an anchor tag that contains block elements.
   *
   * Converts <a href="..."><p>Link</p></a> to <p><a href="...">Link</a></p>
   * This matches CKEditor's behavior.
   *
   * @param \DOMElement $anchor
   *   The anchor element to restructure.
   *
   * @return array
   *   Array of restructured nodes.
   */
  private function restructureAnchorWithBlocks(\DOMElement $anchor): array {
    $dom = $anchor->ownerDocument;
    $result = [];

    // Collect all children of the anchor.
    $children = iterator_to_array($anchor->childNodes);

    // Process each child, grouping consecutive non-block content.
    $i = 0;
    while ($i < count($children)) {
      $child = $children[$i];

      if ($child instanceof \DOMElement && in_array(strtolower($child->tagName), self::BLOCK_ELEMENTS)) {
        // Clone the anchor (attributes only, no children).
        $newAnchor = $dom->createElement('a');
        foreach ($anchor->attributes as $attr) {
          $newAnchor->setAttribute($attr->name, $attr->value);
        }

        // Move the block's children into the new anchor.
        $blockChildren = iterator_to_array($child->childNodes);
        foreach ($blockChildren as $blockChild) {
          $newAnchor->appendChild($blockChild);
        }

        // Put the new anchor inside the block.
        $child->appendChild($newAnchor);

        // Add the block to result.
        $result[] = $child;
        $i++;
      }
      else {
        // Non-block content (phrasing elements, text nodes).
        // Collect consecutive non-block content.
        $phrasingGroup = [];
        while ($i < count($children)) {
          $currentChild = $children[$i];

          // Skip whitespace-only text nodes between blocks.
          if ($currentChild->nodeType === XML_TEXT_NODE && trim($currentChild->nodeValue) === '') {
            $i++;
            continue;
          }

          // If it's a block element, stop collecting.
          if ($currentChild instanceof \DOMElement &&
              in_array(strtolower($currentChild->tagName), self::BLOCK_ELEMENTS)) {
            break;
          }

          // Add to phrasing group.
          $phrasingGroup[] = $currentChild;
          $i++;
        }

        // If we grabbed non-block content, wrap it in a paragraph with anchor.
        if (count($phrasingGroup) > 0) {
          // Create a new paragraph.
          $p = $dom->createElement('p');

          // Create a new anchor inside the paragraph.
          $newAnchor = $dom->createElement('a');
          foreach ($anchor->attributes as $attr) {
            $newAnchor->setAttribute($attr->name, $attr->value);
          }
          $p->appendChild($newAnchor);

          // Move all phrasing content into the new anchor.
          foreach ($phrasingGroup as $phrasingNode) {
            $newAnchor->appendChild($phrasingNode);
          }

          // Add the paragraph to result.
          $result[] = $p;
        }
      }
    }

    return $result;
  }

  /**
   * Wrap orphaned phrasing content in paragraphs.
   *
   * @param array $nodes
   *   Array of nodes to process.
   * @param \DOMElement $parent
   *   The parent element context.
   *
   * @return array
   *   Array of nodes with orphaned content wrapped.
   */
  private function wrapOrphanedContent(array $nodes, \DOMElement $parent): array {
    if (empty($nodes)) {
      return $nodes;
    }

    // Create a new DOM document for creating paragraph elements.
    $newDom = new \DOMDocument('1.0', 'UTF-8');

    // Get the original document from the first node.
    $originalDom = NULL;
    foreach ($nodes as $node) {
      if ($node->ownerDocument) {
        $originalDom = $node->ownerDocument;
        break;
      }
    }

    $result = [];
    $i = 0;

    while ($i < count($nodes)) {
      $node = $nodes[$i];

      // Check if this is orphaned phrasing content.
      if ($this->isOrphanedPhrasingContent($node, $parent)) {
        // Collect consecutive phrasing content.
        $phrasingGroup = [$node];
        $j = $i + 1;

        while ($j < count($nodes)) {
          $nextNode = $nodes[$j];

          // Handle whitespace between phrasing elements.
          if ($nextNode->nodeType === XML_TEXT_NODE && trim($nextNode->nodeValue) === '') {
            // Normalize multiple whitespace to single space.
            $nextNode->nodeValue = ' ';
            $phrasingGroup[] = $nextNode;
            $j++;
            continue;
          }

          if ($this->isOrphanedPhrasingContent($nextNode, $parent)) {
            $phrasingGroup[] = $nextNode;
            $j++;
          }
          else {
            break;
          }
        }

        // Create paragraph with new DOM.
        $p = $newDom->createElement('p');
        $p->setAttribute(self::ADDED_P_MARKER, '1');

        // Append the phrasing nodes to the paragraph.
        foreach ($phrasingGroup as $phrasingNode) {
          // Import the node to the new document.
          $importedNode = $newDom->importNode($phrasingNode, TRUE);
          $p->appendChild($importedNode);
        }

        // Import the paragraph back to the original document if needed.
        if ($originalDom && $originalDom !== $newDom) {
          $p = $originalDom->importNode($p, TRUE);
        }

        $result[] = $p;
        $i = $j;
      }
      else {
        // For non-orphaned node, skip whitespace between two block elements.
        if ($node->nodeType === XML_TEXT_NODE && trim($node->nodeValue) === '') {
          // Check if whitespace is between two block elements.
          $prevIsBlock = FALSE;
          $nextIsBlock = FALSE;

          // Look back for previous non-whitespace node.
          if ($i > 0) {
            for ($k = $i - 1; $k >= 0; $k--) {
              if ($nodes[$k]->nodeType !== XML_TEXT_NODE || trim($nodes[$k]->nodeValue) !== '') {
                $prevIsBlock = $this->isBlockElement($nodes[$k]);
                break;
              }
            }
          }

          // Look ahead for next non-whitespace node.
          if ($i < count($nodes) - 1) {
            for ($k = $i + 1; $k < count($nodes); $k++) {
              if ($nodes[$k]->nodeType !== XML_TEXT_NODE || trim($nodes[$k]->nodeValue) !== '') {
                $nextIsBlock = $this->isBlockElement($nodes[$k]);
                break;
              }
            }
          }

          // Skip whitespace only if both adjacent elements are blocks.
          if ($prevIsBlock && $nextIsBlock) {
            $i++;
            continue;
          }
        }
        $result[] = $node;
        $i++;
      }
    }

    return $result;
  }

  /**
   * Check if a node is orphaned phrasing content.
   *
   * @param \DOMNode $node
   *   The node to check.
   * @param \DOMElement $parent
   *   The parent element context.
   *
   * @return bool
   *   TRUE if the node is orphaned phrasing content.
   */
  private function isOrphanedPhrasingContent(\DOMNode $node, \DOMElement $parent): bool {
    if ($parent instanceof \DOMElement) {
      $parentTag = strtolower($parent->tagName);

      // If parent is a phrasing element, content is not orphaned.
      if (in_array($parentTag, self::PHRASING_ELEMENTS)) {
        if ($parentTag === 'span' && !$parent->hasAttributes()) {
          return TRUE;
        }
        return FALSE;
      }

      // If parent is a text container element, content is not orphaned.
      if (in_array($parentTag, self::TEXT_CONTAINER_ELEMENTS)) {
        return FALSE;
      }
    }

    // Text nodes with content are orphaned if they reach here.
    if ($node->nodeType === XML_TEXT_NODE && trim($node->nodeValue) !== '') {
      return TRUE;
    }

    // Phrasing elements without a safe parent are orphaned.
    if ($node instanceof \DOMElement) {
      $tagName = strtolower($node->tagName);
      if (in_array($tagName, self::PHRASING_ELEMENTS)) {
        // Anchor tags that contain block elements should not be wrapped.
        if ($tagName === 'a' && $this->containsBlockElements($node)) {
          return FALSE;
        }
        return TRUE;
      }
    }

    return FALSE;
  }

  /**
   * Mark paragraphs that should not be merged.
   *
   * Paragraphs that were originally block-level elements (not wrapped by us)
   * and have adjacent block elements should be marked as non-mergeable.
   *
   * @param array $nodes
   *   Array of nodes to process.
   */
  private function markNonMergeableParagraphs(array $nodes): void {
    for ($i = 0; $i < count($nodes); $i++) {
      $node = $nodes[$i];

      // Check if this is a paragraph that was NOT added by us.
      if ($node instanceof \DOMElement &&
          strtolower($node->tagName) === 'p' &&
          !$node->hasAttribute(self::ADDED_P_MARKER)) {

        // Check if it has adjacent block elements (before or after).
        $hasAdjacentBlock = FALSE;

        // Check previous non-whitespace sibling.
        for ($j = $i - 1; $j >= 0; $j--) {
          $prevNode = $nodes[$j];
          if ($prevNode->nodeType === XML_TEXT_NODE && trim($prevNode->nodeValue) === '') {
            continue;
          }
          if ($this->isBlockElement($prevNode)) {
            $hasAdjacentBlock = TRUE;
          }
          break;
        }

        // Check next non-whitespace sibling.
        if (!$hasAdjacentBlock) {
          for ($j = $i + 1; $j < count($nodes); $j++) {
            $nextNode = $nodes[$j];
            if ($nextNode->nodeType === XML_TEXT_NODE && trim($nextNode->nodeValue) === '') {
              continue;
            }
            if ($this->isBlockElement($nextNode)) {
              $hasAdjacentBlock = TRUE;
            }
            break;
          }
        }

        // Mark as non-mergeable if it has adjacent block elements.
        if ($hasAdjacentBlock) {
          $node->setAttribute(self::NOT_MERGEABLE_MARKER, '1');
        }
      }
    }
  }

  /**
   * Check if a node is a block element.
   */
  private function isBlockElement(\DOMNode $node): bool {
    if ($node instanceof \DOMElement) {
      $tagName = strtolower($node->tagName);
      return in_array($tagName, self::BLOCK_ELEMENTS);
    }
    return FALSE;
  }

  /**
   * Merge consecutive paragraphs that were added by this transformer.
   *
   * Paragraphs marked as non-mergeable will not be merged.
   */
  private function mergeAddedParagraphs(\DOMNode $parent): void {
    // Process children first (recursively).
    $children = iterator_to_array($parent->childNodes);
    foreach ($children as $child) {
      if ($child instanceof \DOMElement) {
        $this->mergeAddedParagraphs($child);
      }
    }

    // Merge consecutive added paragraphs at this level.
    $nodesToProcess = iterator_to_array($parent->childNodes);

    $i = 0;
    while ($i < count($nodesToProcess)) {
      $node = $nodesToProcess[$i];

      // Only merge paragraphs that were added by us.
      if ($node instanceof \DOMElement &&
          strtolower($node->tagName) === 'p' &&
          $node->hasAttribute(self::ADDED_P_MARKER) &&
          !$node->hasAttribute(self::NOT_MERGEABLE_MARKER)) {

        // Collect consecutive added paragraphs
        // (that are also not marked as non-mergeable).
        $toMerge = [$node];
        $j = $i + 1;

        while ($j < count($nodesToProcess)) {
          $nextNode = $nodesToProcess[$j];

          // Skip whitespace between paragraphs.
          if ($nextNode->nodeType === XML_TEXT_NODE && trim($nextNode->nodeValue) === '') {
            $j++;
            continue;
          }

          // Check if next is also an added, mergeable paragraph.
          if ($nextNode instanceof \DOMElement &&
              strtolower($nextNode->tagName) === 'p' &&
              $nextNode->hasAttribute(self::ADDED_P_MARKER) &&
              !$nextNode->hasAttribute(self::NOT_MERGEABLE_MARKER)) {
            $toMerge[] = $nextNode;
            $j++;
          }
          else {
            break;
          }
        }

        // If we have multiple consecutive added paragraphs, merge them.
        if (count($toMerge) > 1) {
          $firstP = $toMerge[0];

          for ($k = 1; $k < count($toMerge); $k++) {
            $p = $toMerge[$k];
            // Move all children from this p to the first p.
            while ($p->firstChild) {
              $firstP->appendChild($p->firstChild);
            }
            // Remove the now-empty p.
            if ($p->parentNode) {
              $p->parentNode->removeChild($p);
            }
          }
        }

        $i = $j;
      }
      else {
        $i++;
      }
    }
  }

  /**
   * Remove marker attributes from the document.
   */
  private function removeMarkerAttributes(\DOMDocument $dom): void {
    $xpath = new \DOMXPath($dom);

    // Remove added-p markers.
    $nodes = $xpath->query('//*[@' . self::ADDED_P_MARKER . ']');
    if ($nodes) {
      foreach ($nodes as $node) {
        if ($node instanceof \DOMElement) {
          $node->removeAttribute(self::ADDED_P_MARKER);
        }
      }
    }

    // Remove non-mergeable markers.
    $nodes = $xpath->query('//*[@' . self::NOT_MERGEABLE_MARKER . ']');
    if ($nodes) {
      foreach ($nodes as $node) {
        if ($node instanceof \DOMElement) {
          $node->removeAttribute(self::NOT_MERGEABLE_MARKER);
        }
      }
    }
  }

}
