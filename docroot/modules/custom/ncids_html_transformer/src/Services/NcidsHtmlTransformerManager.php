<?php

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Service to manage and apply all HTML transformers.
 */
class NcidsHtmlTransformerManager implements ContainerInjectionInterface {

  /**
   * Array of transformer services.
   *
   * @var \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerInterface[]
   */
  protected $transformers = [];

  /**
   * Constructor.
   *
   * @param \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerInterface[] $transformers
   *   Array of transformer services.
   */
  public function __construct(array $transformers = []) {
    $this->transformers = $transformers;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    // This will be handled by the service collector.
    return new static();
  }

  /**
   * Add a transformer service (called automatically by service collector).
   *
   * @param \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerBase $transformer
   *   The transformer service.
   * @param string $id
   *   The service ID.
   */
  public function addTransformer(NcidsHtmlTransformerBase $transformer, string $id) {
    $this->transformers[$id] = $transformer;
  }

  /**
   * Pre-process HTML to mark elements that should skip transformation.
   *
   * @param string $html
   *   The HTML to pre-process.
   *
   * @return string
   *   The pre-processed HTML with data attributes added.
   */
  protected function preProcessHtml(string $html): string {
    if (empty(trim($html))) {
      return $html;
    }

    $dom = Html::load($html);
    $xpath = new \DOMXpath($dom);

    $class_mappings = [
      'callout-box' => 'summary-box',
      'callout-box-left' => 'summary-box',
      'callout-box-right' => 'summary-box',
      'callout-box-center' => 'summary-box',
      'complex-table' => 'complex-table',
      'no-bullets' => 'no-bullets',
      'no-description' => 'no-description',
      'pullquote' => 'pullquote',
    ];

    foreach ($class_mappings as $class_name => $data_value) {
      $elements = $xpath->query("//*[contains(concat(' ', normalize-space(@class), ' '), ' {$class_name} ')]");

      foreach ($elements as $element) {
        /** @var \DomElement $element */
        $element->setAttribute('data-html-transformer', $data_value);
      }
    }

    return Html::serialize($dom);
  }

  /**
   * Apply all transformers to the given HTML.
   *
   * @param string $html
   *   The HTML to transform.
   *
   * @return string
   *   The transformed HTML.
   */
  public function transformAll(string $html): string {
    $processed_html = $this->preProcessHtml($html);
    $transformed_html = $processed_html;
    foreach ($this->transformers as $transformer) {
      $transformed_html = $transformer->transform($transformed_html);
    }

    return $transformed_html;
  }

}
