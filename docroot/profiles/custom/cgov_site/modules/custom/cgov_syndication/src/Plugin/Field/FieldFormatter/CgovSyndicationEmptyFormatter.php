<?php

namespace Drupal\cgov_syndication\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Plugin implementation of the 'cgov_syndication_empty_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "cgov_syndication_empty_formatter",
 *   module = "cgov_syndication",
 *   label = @Translation("Empty formatter"),
 *   field_types = {
 *     "hhs_syndication"
 *   }
 * )
 */
class CgovSyndicationEmptyFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    // Does not actually output anything.
    return [];
  }

}
