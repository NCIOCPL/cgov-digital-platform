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
    //
    //    $doc = $this->doc;
    //
    //    $pid = $this->getPercID($row);
    //
    //    $doc->html($value);
    //    $allTags = $doc->getElementsByTagName('a');
    //    for ($i = $allTags->length - 1; $i >= 0; $i--) {
    //    $hrefID = NULL;
    //    $anchor = $allTags->item($i);
    //    if ($anchor instanceof DOMElement) {
    //    $hrefID = $anchor->getAttribute('sys_contentid');
    //    $content = $anchor->html();
    //    if (!empty($hrefID)) {
    //    TODO: If HREF ID is in non migrated microsite ID.
    //    $replacementElement = $doc->createElement('a', $content);
    //    $replacementElement->setAttribute('href', '/node/' . $hrefID);
    //    $anchor->parentNode->replaceChild($replacementElement, $anchor);
    //    $this->migLog->logMessage($pid, 'Link created to perc ID: '
    //    . $hrefID, E_NOTICE, 'LINK REPLACEMENT');
    //    }
    //    }
    //    }
    //    $value = $doc->find('body')->html();
    return $value;
  }

}
