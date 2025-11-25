<?php

namespace Drupal\ncids_html_transformer\Services;

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
   * @param \Drupal\ncids_html_transformer\Services\NcidsHtmlTransformerInterface $transformer
   *   The transformer service.
   * @param string $id
   *   The service ID.
   */
  public function addTransformer(NcidsHtmlTransformerInterface $transformer, string $id) {
    $this->transformers[$id] = $transformer;
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

    // No need to process if HTML is empty or null.
    if (empty(trim($html))) {
      return $html;
    }

    foreach ($this->transformers as $transformer) {
      $html = $transformer->preProcessHtml($html);
    }

    foreach ($this->transformers as $transformer) {
      $html = $transformer->transform($html);
    }

    foreach ($this->transformers as $transformer) {
      $html = $transformer->postProcessHtml($html);
    }

    return $html;
  }

}
