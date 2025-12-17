<?php

declare(strict_types=1);

namespace Drupal\ncids_html_transformer\Services;

use Drupal\Component\Utility\Html;
use Psr\Log\LoggerInterface;

/**
 * Transformer for embedded entities.
 */
class NcidsEmbeddedEntitiesTransformer extends NcidsHtmlTransformerBase {

  /**
   * {@inheritdoc}
   */
  protected static $preprocessElements = [
    'drupal-entity',
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
    $xpath = new \DOMXpath($dom);

    // Find all callout boxes with data-html-transformer.
    $drupal_embeds = $xpath->query("//*[@data-html-transformer='{$this->getShortName()}']");

    foreach ($drupal_embeds as $drupal_embed) {
      /** @var \DOMElement $drupal_embed */
      if ($drupal_embed->hasAttribute('data-embed-button')) {
        $button = $drupal_embed->getAttribute('data-embed-button');
        if ($button !== "insert_block_content") {
          continue;
        }

        $uuid = $drupal_embed->hasAttribute('data-entity-uuid')
          ? $drupal_embed->getAttribute('data-entity-uuid')
          : 'unknown';
        $view_mode = $drupal_embed->getAttribute('data-entity-embed-display');

        switch ($view_mode) {
          case 'view_mode:block_content.embedded_feature_card':
          case 'view_mode:block_content.embedded_feature_card_no_image':
            $drupal_embed->setAttribute('data-embed-button', 'insert_external_link_block');
            break;

          case 'view_mode:block_content.full':
            $drupal_embed->setAttribute('data-embed-button', 'insert_content_block_content');
            break;

          default:
            $this->logger->error('Error Message: uuid @uuid with unknown view mode @view_mode', [
              '@uuid' => $uuid,
              '@view_mode' => $view_mode,
            ]);
            break;
        }
      }
    }

    return Html::serialize($dom);
  }

}
