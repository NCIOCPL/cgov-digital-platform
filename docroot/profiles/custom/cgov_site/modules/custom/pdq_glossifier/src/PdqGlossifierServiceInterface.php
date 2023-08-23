<?php

namespace Drupal\pdq_glossifier;

/**
 * Defines an interface for a  Pdq Glossifier Service.
 */
interface PdqGlossifierServiceInterface {

  /**
   * Update Glossify data.
   *
   * @param array $data
   *   Glossify Data.
   * @param string $now
   *   Current time.
   *
   * @return int
   *   The count of glossary data.
   */
  public function update(array $data, $now);

}
