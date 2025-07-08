<?php

namespace Drupal\cgov_core\Services;

use Drupal\Core\DependencyInjection\ContainerInjectionInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Service to manage and apply all HTML transformers.
 */
class NcidsHtmlTransformerManager implements ContainerInjectionInterface {

  /**
   * Array of transformer services.
   *
   * @var \Drupal\cgov_core\Services\HtmlTransformerInterface[]
   */
  protected $transformers = [];

  /**
   * Constructor.
   *
   * @param \Drupal\cgov_core\Services\HtmlTransformerInterface[] $transformers
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
   * @param \Drupal\cgov_core\Services\HtmlTransformerInterface $transformer
   *   The transformer service.
   * @param string $id
   *   The service ID.
   */
  public function addTransformer(HtmlTransformerInterface $transformer, string $id) {
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
    $transformed_html = $html;

    foreach ($this->transformers as $transformer) {
      $transformed_html = $transformer->transform($transformed_html);
    }

    return $transformed_html;
  }

}
