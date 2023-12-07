<?php

namespace Cgov;

use Cgov\Task\CypressParallel;

/**
 * Trait for cypress parallel classes.
 *
 * @package Acquia\Blt\Custom
 */
trait CypressParallelTrait {

  /**
   * Creates a task to run CypressParallel.
   *
   * @param null|string $pathToCypressParallel
   *   Path to CypressParallel.
   *
   * @return \Robo\Task\Testing\Paratest
   *   Paratest Class.
   */
  protected function taskCypressParallel($pathToParatest = NULL) {
    return $this->task(CypressParallel::class, $pathToParatest);
  }

}
