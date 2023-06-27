<?php

namespace Cgov\Blt\Plugin\Commands\Tests;

use Acquia\Blt\Robo\BltTasks;
use Acquia\Blt\Robo\Exceptions\BltException;

/**
 * Defines commands in the "validate:phpstan" namespace.
 */
class PhpstanCommand extends BltTasks {

  /**
   * An array that contains configuration to customize phpstan commands.
   *
   * @var array
   */
  protected $phpstanConfig;

  /**
   * Executes the phpstan-validate command.
   *
   * @command validate:phpstan
   */
  public function validatePhpstan() {
    $this->phpstanConfig = $this->getConfigValue('validate.phpstan');
    $this->runPhpstan();
  }

  /**
   * Run Phpstan.
   *
   * @throws \Acquia\Blt\Robo\Exceptions\BltException
   * @throws \Robo\Exception\TaskException
   */
  public function runPhpstan() {
    if (isset($this->phpstanConfig['config'])) {
      $config = $this->phpstanConfig['config'];
      $bin = $this->getConfigValue('composer.bin');
      $result = $this->taskExecStack()
        ->dir($this->getConfigValue('repo.root'))
        ->exec("$bin/phpstan --configuration=$config")
        ->run();
      $exit_code = $result->getExitCode();
      if ($exit_code) {
        $this->logger->notice('Review Phpstan issues and re-run.');
        throw new BltException("Failed to run phpstan with config, $config.");
      }
    }
    else {
      $this->logger->notice("Skipping phpstan; no configuration found.");
    }
  }

}
