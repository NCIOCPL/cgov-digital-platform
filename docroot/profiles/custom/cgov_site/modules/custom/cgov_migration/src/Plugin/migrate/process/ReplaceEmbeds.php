<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * Replace percussion inline variants with Drupal embeds..
 *
 * @MigrateProcessPlugin(
 *   id = "replace_embeds"
 * )
 */
class ReplaceEmbeds extends CgovPluginBase {

  protected $migLog;
  protected $doc;

  /**
   * {@inheritdoc}
   */
  public function transform($value,
  MigrateExecutableInterface $migrate_executable,
                            Row $row,
  $destination_property) {

    // Exit early if the field not set.
    if (!isset($value)) {
      return NULL;
    }

    // Setup the DomDocument.
    $doc = $this->doc;
    $pid = $this->getPercID($row);
    $doc->html($value);

    // Find the elements to process.
    $allDivs = $doc->getElementsByTagName('placeholder');

    $this->processEmbeds($pid, $allDivs, 'EMBED');

    // Return the value.
    $body = $doc->find('body');
    if ($body->count() > 0) {
      $value = $body->html();
    }

    return $value;
  }

}
