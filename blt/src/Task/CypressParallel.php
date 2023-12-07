<?php

namespace Cgov\Task;

use Robo\Contract\CommandInterface;
use Robo\Contract\PrintedInterface;
use Robo\Task\BaseTask;
use Robo\Exception\TaskException;

/**
 * Runs Cypress tests.
 *
 * ``` php
 * <?php
 * $this->taskCypressParallel()
 *  ->script('cy:run')
 *  ->threads(2)
 *  ->run()
 *
 * ?>
 * ```
 */
class CypressParallel extends BaseTask implements CommandInterface, PrintedInterface {
  use \Robo\Common\ExecOneCommand;

  /**
   * Number of threads for cypress.
   *
   * @var integer
   */
  protected $cypressThreads = 2;

  /**
   * Cypress script file.
   *
   * @var string
   */
  protected $scriptFile = 'cy:run';

  /**
   * Command variable.
   *
   * @var string
   */
  protected $command;

  /**
   * Cypress constructor.
   *
   * @param string $pathToCypress
   *   Path to cypress.
   *
   * @throws \Robo\Exception\TaskException
   */
  public function __construct($pathToCypress = NULL) {
    $this->command = $pathToCypress;

    $this->option('-t', $this->cypressThreads);
    $this->option('-n', '/usr/local/versions/node/v16.13.0/lib/node_modules/cypress-multi-reporters');
    if (!$this->command) {
      $this->command = $this->findExecutable('cypress-parallel');
    }
    if (!$this->command) {
      throw new TaskException(__CLASS__, "cypress-parallel executable file not found");
    }
  }

  /* @todo Add properties for all the parameters for cypress-parallel */
  /**
   * Reporter to pass to Cypress.
   *
   * @param string $reporter
   *   Reporter option.
   *
   * @return $this
   */
  public function setReporter($reporter) {
    $this->option('-r', $reporter);
    return $this;
  }

  /**
   * Set reporter options.
   *
   * @param string $reporterOption
   *   Reporter option.
   *
   * @return $this
   */
  public function setReporterOption($reporterOption) {
    $this->option('-o', $reporterOption);
    return $this;
  }

  /**
   * Set exit on first failing thread.
   *
   * @param string $bail
   *   Bail.
   *
   * @return $this
   */
  public function setBail($bail) {
    $this->option('-b', $bail);
    return $this;
  }

  /**
   * Set the reporter module path.
   *
   * @param string $reporterModulePath
   *   Reporter module path.
   *
   * @return $this
   */
  public function setReporterModulePath($reporterModulePath) {
    $this->option('-n', $reporterModulePath);
    return $this;
  }

  /**
   * Set npm Cypress command.
   *
   * @return $this
   */
  public function script() {
    $this->option('-s', $this->scriptFile);
    return $this;
  }

  /**
   * Set number of threads.
   *
   * @param integer $threads
   *   Number of threads.
   *
   * @return $this
   */
  public function threads($threads = 0) {
    if (!empty($threds)) {
      $this->option('-t', $threads);
    }
    return $this;
  }

  /**
   * Cypress mode.
   *
   * @return $this
   */
  public function mode() {
    $this->option('-m', "false");
    return $this;
  }

  /**
   * Set parallel weights json file.
   *
   * @param string $weightFile
   *   Weight file location.
   *
   * @return $this
   */
  public function setWeightFile($weightFile) {
    $this->option('-w', $weightFile);
    return $this;
  }

  /**
   * {@inheritdoc}
   */
  public function getCommand() {
    return $this->command . $this->arguments;
  }

  /**
   * {@inheritdoc}
   */
  public function run() {
    $this->printTaskInfo('Running Cypress {arguments}', ['arguments' => $this->arguments]);
    return $this->executeCommand($this->getCommand());
  }

}
