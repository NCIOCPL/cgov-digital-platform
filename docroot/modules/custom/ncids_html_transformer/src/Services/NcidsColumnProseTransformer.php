<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transformer that adds usa-prose class to USWDS column elements.
 *
 * USWDS (U.S. Web Design System) column elements control layout but don't
 * provide text styling. This transformer adds the usa-prose class to column
 * divs to ensure proper text formatting and styling.
 *
 * @see https://designsystem.digital.gov/utilities/layout-grid/
 */
class NcidsColumnProseTransformer extends NcidsHtmlTransformerBase {

  /**
   * USWDS column class patterns to match.
   *
   * Matches column classes like:
   * - grid-col, grid-col-1 through grid-col-12
   * - tablet:grid-col, tablet:grid-col-1 through tablet:grid-col-12
   * - desktop:grid-col, desktop:grid-col-1 through desktop:grid-col-12
   * - mobile:, mobile-lg:, widescreen:, and other responsive prefixes.
   */

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    if (empty(trim($html))) {
      return $html;
    }

    $dom = Html::load($html);
    $xpath = new \DOMXPath($dom);

    // Find all divs that have a USWDS column class.
    $nodes = $xpath->query('.//div[contains(@class, " grid-col")] | .//div[starts-with(@class, "grid-col")] | .//div[contains(@class, ":grid-col")]');

    foreach ($nodes as $node) {
      if ($node instanceof \DOMElement) {
        $this->addUsaProsaClass($node);
      }
    }

    return Html::serialize($dom);
  }

  /**
   * Add usa-prose class to a column element.
   *
   * Adds usa-prose class to the element if it doesn't already have it.
   * Preserves all existing classes.
   *
   * @param \DOMElement $element
   *   The element to update.
   */
  private function addUsaProsaClass(\DOMElement $element): void {
    $currentClass = $element->getAttribute('class') ?? '';
    $classArray = array_filter(explode(' ', $currentClass));

    // Only add if it's not already present.
    if (!in_array('usa-prose', $classArray, TRUE)) {
      $classArray[] = 'usa-prose';
      $element->setAttribute('class', implode(' ', $classArray));
    }
  }

}
