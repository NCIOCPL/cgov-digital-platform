<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\ProcessPluginBase;
// Use PHPHtmlParser\Dom;.
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

}
