<?php

namespace Drupal\cgov_migration\Plugin\migrate\process;

use Drupal\migrate\MigrateExecutableInterface;
use Drupal\migrate\Row;

/**
 * Replace percussion relationships divs with temporary placeholders.
 *
 * @MigrateProcessPlugin(
 *   id = "generate_placeholders"
 * )
 */
class GeneratePlaceholders extends CgovPluginBase {
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

    $doc = $this->doc;

    $pid = $this->getPercID($row);

    $doc->html($value);

    // Generate EMBED Placeholders.
    $allDivs = $doc->getElementsByTagName('div');
    for ($i = $allDivs->length - 1; $i >= 0; $i--) {
      $divNode = $allDivs->item($i);

      $sys_relationshipid = $divNode->getAttr('sys_relationshipid');
      if (!empty($sys_relationshipid)) {

        // The variant ID.
        $sys_dependentvariantid = $divNode->getAttr('sys_dependentvariantid');

        // The embedded items ID.
        $sys_dependentid = $divNode->getAttr('sys_dependentid');

        $replacementDiv = $doc->createElement('placeholder', 'EMBEDDED PLACEHOLDER  - ' . $sys_dependentid);
        $replacementDiv->setAttribute('sys_dependentid', $sys_dependentid);
        $replacementDiv->setAttribute('sys_dependentvariantid', $sys_dependentvariantid);

        $divNode->parentNode->replaceChild($replacementDiv, $divNode);
        $this->migLog->logMessage($pid, 'Placeholder created for perc ID: ' . $sys_dependentid, E_NOTICE, 'EMBEDDED PLACEHOLDER');
      }
    }

    // Generate LINK Placeholders
    // Generate INLINE IMAGE Placeholders.
    $body = $doc->find('body');
    $size = $body->count();
    if ($size > 0) {
      $value = $body->html();
    }
    return $value;
  }

}
