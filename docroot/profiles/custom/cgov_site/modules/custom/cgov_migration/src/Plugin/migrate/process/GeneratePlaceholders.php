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
    $allDivs = $doc->getElementsByTagName('div');
    for ($i = $allDivs->length - 1; $i >= 0; $i--) {
      $divNode = $allDivs->item($i);

      $src = $divNode->getAttr('sys_relationshipid');
      if (!empty($src)) {
        $replacementDiv = $doc->createElement('div', 'CONTENT HERE - ' . $src);
        $divNode->parentNode->replaceChild($replacementDiv, $divNode);
        $this->migLog->logMessage($pid, 'Placeholder created for perc ID: ' . $src, E_NOTICE, 'PLACEHOLDER');
      }
    }

    $body = $doc->find('body');
    $size = $body->count();
    if ($size > 0) {
      $value = $body->html();
    }
    return $value;
  }

}
