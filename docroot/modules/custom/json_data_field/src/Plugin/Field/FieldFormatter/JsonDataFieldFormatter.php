<?php

namespace Drupal\json_data_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;

/**
 * Fake field formatter for JSON Data Field.
 *
 * We don't ouptut anything with the json_data field type, so this formatter
 * is just a placeholder.
 *
 * @FieldFormatter(
 *   id = "json_data_formatter",
 *   label = @Translation("JSON Data Field formatter"),
 *   field_types = {"json_data"}
 * )
 */
class JsonDataFieldFormatter extends FormatterBase implements ContainerFactoryPluginInterface {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    // This formatter deliberately outputs nothing.
    return [];
  }

}
