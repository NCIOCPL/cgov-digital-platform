<?php

namespace Cgov;

use Cgov\Task\Npm\CleanInstall;
use Cgov\Task\Npm\RunScript;
use Robo\Task\Npm\Install;

/**
 * Trait for NPM helper tasks.
 *
 * @package Acquia\Blt\Custom
 */
trait CgovNpmTrait {

  /**
   * Creates a task to run an npm install.
   *
   * @param null|string $pathToNpm
   *   Path to a specific NPM installation.
   *
   * @return \Robo\Collection\CollectionBuilder
   *   CollectionBuilder for executing the npm install task.
   */
  protected function taskNpmInstall($pathToNpm = NULL) {
    return $this->task(Install::class, $pathToNpm);
  }

  /**
   * Creates a task to run an npm clean install.
   *
   * @param null|string $pathToNpm
   *   Path to a specific NPM installation.
   *
   * @return \Robo\Collection\CollectionBuilder
   *   CollectionBuilder for executing the npm ci task.
   */
  protected function taskNpmCleanInstall($pathToNpm = NULL) {
    return $this->task(CleanInstall::class, $pathToNpm);
  }

  /**
   * Creates a task to run an npm script.
   *
   * @param null|string $pathToNpm
   *   Path to a specific NPM installation.
   *
   * @return \Robo\Collection\CollectionBuilder
   *   CollectionBuilder for executing the npm run-script task.
   */
  protected function taskNpmRunScript($pathToNpm = NULL) {
    return $this->task(RunScript::class, $pathToNpm);
  }

}
