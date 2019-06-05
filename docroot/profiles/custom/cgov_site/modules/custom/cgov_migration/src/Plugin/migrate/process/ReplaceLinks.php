<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * Replace percussion links divs with drupal node links.
 *
 * @MigrateProcessPlugin(
 *   id = "replace_links"
 * )
 */
class ReplaceLinks extends CgovPluginBase {


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

    // Setup the document.
    $doc = $this->doc;
    $pid = $this->getPercID($row);
    $doc->html($value);

    // Loop through the anchor elements and search for ones with dependent ID's.
    // Replace those anchors with the equivalent drupal '/node/id' URL.
    $anchors = $doc->getElementsByTagName('a');
    foreach ($anchors as $anchor) {

      $hrefID = $anchor->getAttribute('sys_dependentid');
      $content = $anchor->nodeValue;
      if (!empty($hrefID)) {

        $replacementElement = $doc->createElement('a', $content);
        $replacementElement->setAttribute('href', '/node/' . $hrefID);
        $anchor->parentNode->replaceChild($replacementElement, $anchor);
        $this->migLog->logMessage($pid, 'Link created to perc ID: '
              . $hrefID, E_NOTICE, 'LINK REPLACEMENT');
      }
    }
    // Returned the processed document value.
    $body = $doc->find('body');
    $size = $body->count();
    if ($size > 0) {
      $value = $body->html();
    }

    return $value;
  }

}
