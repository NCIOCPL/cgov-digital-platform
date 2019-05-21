<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateSkipRowException;
use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * Remove the rxbodyfield wrapper..
 *
 * @MigrateProcessPlugin(
 *   id = "remove_rx_wrapper"
 * )
 */
class RemoveRxWrapper extends CgovPluginBase {


  protected $migLog;
  protected $doc;

  /**
   * {@inheritdoc}
   */
  public function transform($value, MigrateExecutableInterface $migrate_executable, Row $row, $destination_property) {

    // TODO: Extract out into a generic migration validator.
    if ($row->hasSourceProperty('para_id')) {
      $pid = $row->getSource()['para_id'];
    }
    elseif ($row->hasSourceProperty('id')) {
      $pid = $row->getSource()['id'];
    }
    elseif ($row->hasSourceProperty('citation_id')) {
      $pid = $row->getSource()['citation_id'];
    }
    elseif ($row->hasSourceProperty('row_rid')) {
      $pid = $row->getSource()['row_rid'];
    }
    else {
      $message = "Item skipped due to missing id or para_id.";
      $this->migLog->logMessage(NULL, $message, E_ERROR);

      throw new MigrateSkipRowException();
    }

    // Exit early if the field not set.
    if (!isset($value)) {
      return NULL;
    }

    // Load the incoming HTML.
    $this->doc->html($value);

    // Log a warning if the rxbody div isn't the first element.
    $root = $this->doc->find('html');
    $children = $root->find('body')->children();

    if ($children->count() > 0) {
      $isFirstRx = $children->first()->hasClass('rxbodyfield');

      if (!$isFirstRx) {
        $message = 'RxBodyfield is not the first element.';
        $this->migLog->logMessage($pid, $message, E_WARNING);
      }
    }

    // Find elements with the class.
    $elements = $this->doc->find('.rxbodyfield');
    $size = $elements->count();

    // Log an throw an error if there is more than one.
    if ($size > 1) {
      $message = 'The incoming item has ' . $size . ' .rxbodyfield items.';
      $this->migLog->logMessage($pid, $message, E_ERROR);
      throw new MigrateSkipRowException();
    }
    else {
      // Retrieve the content.
      $value = $elements->first()->html();
    }

    return $value;
  }

}
