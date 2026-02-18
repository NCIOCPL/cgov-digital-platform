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
   * {@inheritdoc}
   */
  private const HIGHCHART_UUIDS = [
    '2eb6563f-ca7f-4e80-a6a2-ff7d86cddfde',
    '8f8303e3-7107-4ce6-924a-d424a804c50e',
    'a516f1f6-3d1f-497a-ab89-c5632b6a9c7a',
    '9dbe5458-6cbe-418c-968c-859d76e05118',
    '8198eb3c-a21c-4f31-8cdf-7aa8e4be0e53',
    '1d03e058-f5a9-45fa-acbc-5aef8854d4e1',
    '8adc95ce-5899-4a96-95bf-26970ec97ca3',
    'ef5d5ba9-f42a-4781-90c1-e378989f24a1',
    'e8605510-59ec-4282-a1bd-d1fbf433557a',
    'badec603-f877-4691-b0c5-f75111e1b7f2',
    'ad87f1da-cfeb-4821-ab85-da4d602afe81',
    '2c3f7767-96d0-4c46-9bef-c3e00bbb6f29',
    'fd13d6a6-b04d-4220-b53c-c7aad8ae52f3',
    '9834f764-171d-4f70-a272-0fcce37a93ae',
    'abf2776a-70f8-40de-b550-e9d01c2f9c24',
    // Add more UUIDs if needed (it's not).
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
            // If the uuid is in the list of highchart uuids, set the
            // data-entity-embed-display attribute on the embedded entity
            // to the right view_mode for highcharts.
            if (in_array($uuid, self::HIGHCHART_UUIDS)) {
              $drupal_embed->setAttribute('data-entity-embed-display', 'view_mode:block_content.legacy_highchart');
            }
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
