<?php

namespace Drupal\cgov_schema_org\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Field\FieldItemListInterface;

/**
 * Plugin implementation of the 'cgov_schema_org_empty_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "cgov_schema_org_empty_formatter",
 *   module = "cgov_schema_org",
 *   label = @Translation("Empty formatter"),
 *   field_types = {
 *     "schema_org_data"
 *   }
 * )
 */
class CgovSchemaOrgEmptyFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    // Does not actually output anything.
    return [];
  }

}
