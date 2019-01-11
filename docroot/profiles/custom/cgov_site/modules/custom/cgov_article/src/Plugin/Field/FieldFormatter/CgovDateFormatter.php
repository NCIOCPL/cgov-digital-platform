<?php

namespace Drupal\cgov_article\Plugin\Field\FieldFormatter;

use Drupal\Component\Utility\Html;
use Drupal\Core\Field\FieldItemInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\datetime\Plugin\Field\FieldFormatter\DateTimeDefaultFormatter;

/**
 * Plugin implementation of the 'cgov_date_formatter' formatter.
 *
 * @FieldFormatter(
 *   id = "cgov_date_formatter",
 *   label = @Translation("Cgov date"),
 *   field_types = {
 *     "datetime"
 *   }
 * )
 */
class CgovDateFormatter extends DateTimeDefaultFormatter {

  /**
   * Filter Date.
   *
   * If a date display mode field exists on the same entity as this field
   * and if that field contains a reference to this field, further logic
   * will be executed to determine if this field should be displayed.
   * If the date display mode field exists and doesn't reference this
   * field, then this field should not be rendered.
   * In all other cases it should be displayed as normal.
   *
   * @param \Drupal\Core\Field\FieldItemListInterface $items
   *   The current field's List interface.
   */
  public function cgovDateFilter(FieldItemListInterface $items) {
    $node = $items->getEntity();
    if (!$node) {
      return TRUE;
    }

    $displayModesList = $node->toArray()["field_date_display_mode"];

    // We aren't filtering if there isn't a date display mode.
    // (This is a guard, but shouldn't be an issue if this filter
    // is only used on fields on content types that have a
    // field_date_display_mode).
    if ($displayModesList === NULL) {
      return TRUE;
    }

    // Clean up displayModes so it's a simple array to work with
    // and so that it references dates by machine name.
    $filteredDates = array_map(function ($arr) {
      return 'field_date_' . $arr['value'];
    }, $displayModesList);

    $currentField = $this->fieldDefinition->getName();
    // If this date field is not selected for display, we don't
    // want to render it, obviously.
    if (!in_array($currentField, $filteredDates)) {
      return FALSE;
    }

    // The date entities to pass to the render array.
    // (They are not renderable in the twig template in their current state).
    $dateEntities = [];
    foreach ($filteredDates as $machineName) {
      $dateEntities[$machineName] = $node->get($machineName);
    }

    // NOTE: This is where we can set logic path, instead of using the node type
    // we can pull that off of another field set by the user that determines the
    // display mode (all, latest, oldest...).
    $nodeType = $node->getType();
    $isArticlePage = $nodeType === 'cgov_article';
    if ($isArticlePage) {
      // --------------------------------------------------------------------
      // TODO: if() code should be an external function, taking and returning
      // $dateEntities array, for cleanness.
      // --------------------------------------------------------------------
      // 1. Create a multidimensional array with the date value for sorting.
      $dateEntitiesWithValues = [];
      foreach ($dateEntities as $machineName => $dateEntity) {
        $dateEntitiesWithValues[] = [
          $machineName,
          $dateEntity,
          // The following retrieves the DateTimeItem fromt he DateTimeItemList
          // and then pulls it's datetime_iso8601 time for sorting, rather than
          // the formatted value.
          $dateEntity->get(0)->value,
        ];
      };

      // 2. Sort (in place) according to datetime_iso8601 value ascending.
      usort($dateEntitiesWithValues, function ($entity1, $entity2) {
        $entity1UnixTime = strtotime($entity1[2]);
        $entity2UnixTime = strtotime($entity2[2]);
        if ($entity1UnixTime == $entity2UnixTime) {
          return 0;
        }
        return ($entity1UnixTime > $entity2UnixTime) ? 1 : -1;
      });

      // 3. Retrieve most recent value after sort.
      $mostRecentDate = array_pop($dateEntitiesWithValues);
      $mostRecentDateMachineName = $mostRecentDate[0];
      if ($mostRecentDateMachineName !== $currentField) {
        return FALSE;
      }
    }

    return TRUE;
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = [];
    $shouldDisplayDate = $this->cgovDateFilter($items);
    if ($shouldDisplayDate) {
      return parent::viewElements($items, $langcode);
    }

    return $elements;
  }

  /**
   * Generate the output appropriate for one field item.
   *
   * @param \Drupal\Core\Field\FieldItemInterface $item
   *   One field item.
   *
   * @return string
   *   The textual output generated.
   */
  protected function viewValue(FieldItemInterface $item) {
    // The text value has no text format assigned to it, so the user input
    // should equal the output, including newlines.
    return nl2br(Html::escape($item->value));
  }

}
