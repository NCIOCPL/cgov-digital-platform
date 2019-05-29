<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
use Drupal\migrate\MigrateSkipRowException;
use DOMWrap\Document;

/**
 * Base plugin class for Cgov Migration.
 */
abstract class CgovPluginBase extends ProcessPluginBase {

  protected $migLog;
  protected $doc;

  /**
   * {@inheritdoc}
   */
  public function __construct() {
    $this->migLog = \Drupal::service('cgov_migration.migration_logger');
    $this->doc = new Document();

  }

  /**
   * Return the incoming percussion ID from the Row.
   */
  public function getPercId($row) {
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

    return $pid;
  }

}
