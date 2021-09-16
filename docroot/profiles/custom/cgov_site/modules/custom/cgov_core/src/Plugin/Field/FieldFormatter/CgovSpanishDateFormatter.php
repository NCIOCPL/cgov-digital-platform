<?php

namespace Drupal\cgov_core\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\FormStateInterface;
use Drupal\datetime\Plugin\Field\FieldFormatter\DateTimeDefaultFormatter;

/**
 * Plugin implementation of the 'cgov_sp_date_formatter' formatter.
 *
 * If a date display mode field exists on the same entity as this field
 * and if that field contains a reference to this field, further logic
 * will be executed to determine if this field should be displayed.
 *
 * @FieldFormatter(
 *   id = "cgov_sp_date_formatter",
 *   label = @Translation("Cgov Spanish date"),
 *   field_types = {
 *     "datetime"
 *   }
 * )
 */
class CgovSpanishDateFormatter extends DateTimeDefaultFormatter {

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = [];
    $summary[] = $this->t('Date in lowercase.');
    return $summary;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    foreach ($items as $delta => $item) {
      if ($item->date) {
        /** @var \Drupal\Core\Datetime\DrupalDateTime $date */
        $date = $item->date;
        $elements[$delta] = $this->buildDateWithIsoAttribute($date);
        if (!empty($item->_attributes)) {
          $elements[$delta]['#attributes'] += $item->_attributes;
          // Unset field item attributes since they have been included in the
          // formatter output and should not be rendered in the field template.
          unset($item->_attributes);
        }
      }
    }

    if ($langcode == 'es') {
      $elements[0]['#text'] = strtolower($elements[0]['#text']);
    }
    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return [
      'display_strategy' => 'all',
    ] + parent::defaultSettings();
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $form = parent::settingsForm($form, $form_state);

    $form['display_strategy'] = [
      '#type' => 'select',
      '#title' => $this->t('Display Strategy'),
      '#description' => $this->t("Choose filter method for displaying dates selected in date display mode field."),
      '#options' => ['all' => $this->t('Show All'), 'latest' => $this->t('Show Latest')],
      '#default_value' => $this->getSetting('display_strategy'),
    ];

    return $form;
  }

}
