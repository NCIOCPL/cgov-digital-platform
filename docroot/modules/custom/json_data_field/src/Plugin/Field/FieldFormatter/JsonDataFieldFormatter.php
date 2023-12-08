<?php

namespace Drupal\json_data_field\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\Yaml\Dumper;
use Symfony\Component\Yaml\Yaml as SymfonyYaml;

/**
 * Field formatter for JSON Data Field.
 *
 * @FieldFormatter(
 *   id = "json_data_formatter",
 *   label = @Translation("JSON Data Field formatter"),
 *   field_types = {"json_data"}
 * )
 */
class JsonDataFieldFormatter extends FormatterBase implements ContainerFactoryPluginInterface {

  /* SETTINGS
   * For now we do not need defaultSettings(), settingsSummary() nor
   * settingsForm() because we do not have any settings.
   */

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    $yaml_data = '';
    foreach ($items as $delta => $item) {
      $data_value = $item->get('value')->getValue();
      if ($data_value) {
        // Convert the PHP array into YAML data.
        $dumper = new Dumper(2);
        $yaml = $dumper->dump($data_value, PHP_INT_MAX, 0, SymfonyYaml::DUMP_EXCEPTION_ON_INVALID_TYPE | SymfonyYaml::DUMP_MULTI_LINE_LITERAL_BLOCK);

        // Remove return after array delimiter.
        $yaml = preg_replace('#((?:\n|^)[ ]*-)\n[ ]+(\w|[\'"])#', '\1 \2', $yaml);

        $yaml_data = trim($yaml);
      }

      $elements[$delta] = [
        '#type' => 'html_tag',
        '#tag' => 'pre',
        'child' => [
          '#type' => 'html_tag',
          '#tag' => 'code',
          '#value' => $yaml_data,
          '#format' => $item->format,
          '#langcode' => $item->getLangcode(),
        ],
      ];
    }

    return $elements;
  }

}
