<?php

namespace Acquia\Blt\Custom;

use Acquia\Blt\Custom\Task\Paratest;

/**
 * Trait ParatestTrait.
 *
 * @package Acquia\Blt\Custom
 */
trait ParatestTrait {

  /**
   * Creates a task to run Paratest.
   *
   * @param null|string $pathToParatest
   *   Path to Paratest.
   *
   * @return \Robo\Task\Testing\Paratest
   *   Paratest Class.
   */
  protected function taskParatest($pathToParatest = NULL) {
    return $this->task(Paratest::class, $pathToParatest);
  }

}
