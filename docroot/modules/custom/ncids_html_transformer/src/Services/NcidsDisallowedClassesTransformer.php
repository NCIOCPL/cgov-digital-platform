<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;

/**
 * Transforms HTML by removing disallowed classes.
 */
class NcidsDisallowedClassesTransformer extends NcidsHtmlTransformerBase {

  /**
   * Allowed class combinations with their element restrictions.
   *
   * @var array
   */
  protected array $allowedClassCombinations = [
    'div' => [
      ['callout-box'],
      ['az-list'],
      ['callout-box-center'],
      ['callout-box', 'center'],
      ['callout-box-full'],
      ['callout-box-left'],
      ['callout-box-right'],
      ['grid-col'],
      ['grid-col-2'],
      ['grid-col-3'],
      ['grid-col-4'],
      ['grid-col-6'],
      ['grid-col-9'],
      ['grid-col-fill'],
      ['grid-container'],
      ['grid-gap'],
      ['grid-gap-2'],
      ['grid-gap-3'],
      ['grid-gap-4'],
      ['grid-gap-5'],
      ['grid-gap-6'],
      ['grid-gap-sm'],
      ['grid-gap-md'],
      ['grid-gap-lg'],
      ['grid-row'],
      ['mobile-lg:grid-col'],
      ['pullquote'],
      ['pullquote-center'],
      ['pullquote-left'],
      ['pullquote-right'],
      ['row'],
      ['tablet:grid-col'],
      ['tablet:grid-col-2'],
      ['tablet:grid-col-3'],
      ['tablet:grid-col-4'],
      ['tablet:grid-col-5'],
      ['tablet:grid-col-6'],
      ['tablet:grid-col-7'],
      ['tablet:grid-col-8'],
      ['tablet:grid-col-9'],
      ['usa-summary-box'],
      ['usa-summary-box__body'],
      ['usa-summary-box__text'],
    ],
    'p' => [
      ['author'],
      ['pullquote-text'],
    ],
    'aside' => [
      ['callout-box'],
      ['callout-box-center'],
      ['callout-box-full'],
      ['callout-box-right'],
    ],
    'table' => [
      ['complex-table'],
      ['table-default'],
    ],
    'a' => [
      ['definition'],
      ['usa-button'],
      ['usa-button--nci-full-width'],
      ['usa-button--outline'],
      ['usa-button--secondary'],
      ['usa-summary-box__link'],
    ],
    'ul' => [
      ['no-bullets'],
      ['no-bullets-indent'],
      ['no-description'],
    ],
    'td' => [
      ['text-left'],
    ],
    'h3' => [
      ['usa-summary-box__heading'],
    ],
  ];

  /**
   * {@inheritdoc}
   */
  public function transform(string $html): string {
    if (empty($html)) {
      return $html;
    }
    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    // Process elements with class attributes.
    $elements = $xpath->query('//*[@class]');
    if ($elements) {
      foreach ($elements as $element) {
        /** @var \DOMElement $element */
        if ($this->shouldSkipElement($element)) {
          continue;
        }
        $this->processElementClasses($element);
      }
    }

    return Html::serialize($dom);
  }

  /**
   * Processes element classes according to allowed combinations.
   *
   * @param \DOMElement $element
   *   The DOM element to process.
   */
  protected function processElementClasses($element): void {
    $tagName = strtolower($element->tagName);
    $classes = $element->getAttribute('class');
    $classArray = array_filter(explode(' ', $classes));
    $cleanedClasses = [];

    // Check if element has allowed class combinations.
    if (isset($this->allowedClassCombinations[$tagName])) {
      foreach ($this->allowedClassCombinations[$tagName] as $allowedCombination) {
        if ($this->hasAllClasses($classArray, $allowedCombination)) {
          foreach ($allowedCombination as $class) {
            $cleanedClasses[] = $class;
          }
        }
      }
    }

    if (empty($cleanedClasses)) {
      $element->removeAttribute('class');
    }
    else {
      $element->setAttribute('class', implode(' ', array_unique($cleanedClasses)));
    }
  }

  /**
   * Checks if all classes in a combination are present.
   *
   * @param array $classArray
   *   Array of classes to check.
   * @param array $combination
   *   Required class combination.
   *
   * @return bool
   *   TRUE if all required classes are present.
   */
  protected function hasAllClasses(array $classArray, array $combination): bool {
    return empty(array_diff($combination, $classArray));
  }

}
