<?php

namespace Drush\Commands\cgov;

use Drush\Commands\DrushCommands;
use Drupal\Core\StringTranslation\StringTranslationTrait;

/**
 * A Drush commandfile to load pdq glossifier.
 */
class CgovPdqGlossifyCommands extends DrushCommands {

  use StringTranslationTrait;

  /**
   * Glossifier data based on an input file.
   *
   * @param string $glossifierFile
   *   Path to the json file containing the glosiify information.
   *
   * @command cgov:load-glossifier
   * @aliases load-glossifier, cgpdg
   * @usage drush cgov:load-glossifier /tmp/glossifier_refresh.json
   *   Process json content for glossifier
   * @bootstrap full
   */
  public function loadPdqGlossifier($glossifierFile) {
    if (!file_exists($glossifierFile)) {
      throw new \Exception(dt('Unable to load file !file.', ['!file' => $glossifierFile]));
    }
    $jsonData = file_get_contents($glossifierFile);
    if (empty($jsonData)) {
      throw new \Exception(dt('File data empty in !file.', ['!file' => $glossifierFile]));
    }
    $now = date('Y-m-d H:i:s');
    $count = \Drupal::service('pdq_glossifier.data')->update(json_decode($jsonData, TRUE), $now);
    $this->logger()->success($this->t('Stored @arg glossary terms', ['@arg' => $count]));
  }

}
