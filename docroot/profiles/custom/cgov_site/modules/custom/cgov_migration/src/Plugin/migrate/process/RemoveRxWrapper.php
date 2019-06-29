<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;
use Drupal\migrate\MigrateSkipRowException;

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

    // Exit early if the field not set.
    if (!isset($value)) {
      return NULL;
    }

    $pid = $this->getPercID($row);

    // Load the incoming HTML.
    $this->doc->html($value);

    // Find elements with the class.
    $rxBodyFieldElement = $this->doc->find('.rxbodyfield');
    $size = $rxBodyFieldElement->count();

    // Log an throw an error if there is more than one.
    if ($size > 1) {
      $message = 'The incoming item has ' . $size . ' .rxbodyfield items.';
      $this->migLog->logMessage($pid, $message, E_ERROR, 'RXBODY');
      throw new MigrateSkipRowException();
    }
    elseif ($size == 1) {
      // Retrieve the content.
      $body = $this->doc->find('body')->html();

      preg_match('/<div\s+class="rxbodyfield"\s?+>\s?</', $body, $matches);

      if (empty($matches)) {
        $cleanBody = preg_replace('/ class="rxbodyfield"/', '', $body);
        $value = $cleanBody;
      }
      else {
        preg_match('/<div\s+class="rxbodyfield">(.*)<\/div>/s', $body, $strippedMatches);
        $value = $strippedMatches[1];
      }
    }
    return $value;
  }

}
