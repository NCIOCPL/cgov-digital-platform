<?php

namespace Cgov\Blt\Plugin\Commands\Tests;

use Acquia\Blt\Robo\Commands\Tests\TestsCommandBase;
use Acquia\Blt\Robo\Exceptions\BltException;
use Cgov\CypressParallelTrait;

/**
 * Defines commands in the "tests" namespace.
 */
class CypressTestCommand extends TestsCommandBase {
  use CypressParallelTrait;

  /**
   * An array that contains cypress test directories.
   *
   * @var array|string
   */
  protected $cypressTests;

  /**
   * Number of threads to be executed through cypress parallel.
   *
   * @var integer
   */
  protected $cypressNumberOfThreads;

  /**
   * Cypress weight file location.
   *
   * @var string
   */
  protected $cypressWeightFile;

  /**
   * This hook will fire for all commands in this command file.
   *
   * @hook init
   */
  public function initialize() {
    parent::initialize();
  }

  /**
   * Entrypoint for running cypress tests.
   *
   * @command tests:cypress:run
   * @description Executes all cypress tests. This optionally launch Selenium
   *   prior to execution.
   * @usage
   *   Executes all configured tests.
   * @usage -D tests.cypress.paths=${PWD}/tests/cypress/features/
   *
   * @aliases tcr cypress tests:cypress
   *
   * @interactGenerateSettingsFiles
   * @interactInstallDrupal
   * @validateDrupalIsInstalled
   * @launchWebServer
   *
   * @throws \Acquia\Blt\Robo\Exceptions\BltException
   * @throws \Exception
   */
  public function cypress() {
    $this->cypressTests = $this->getConfigValue('tests.cypress.paths');
    $this->cypressWeightFile = $this->getConfigValue('tests.cypress.weights-file');
    $this->cypressNumberOfThreads = $this->getConfigValue('tests.cypress.num-threads');
    try {
      $this->executeCypressTests();
    }
    catch (\Exception $e) {
      throw $e;
    }
  }

  /**
   * Executes all behat tests in behat.paths configuration array.
   *
   * @throws \Exception
   *   Throws an exception if any Behat test fails.
   */
  protected function executeCypressTests() {
     $task = $this->taskCypressParallel()
    //$task = $this->taskCypressParallel($this->getConfigValue('repo.root') . '/tests/cypress/node_modules/cypress-parallel/cli.js')
      ->script()
      ->threads($this->cypressNumberOfThreads)
      ->mode()
      ->dir($this->getConfigValue('repo.root') . '/tests/cypress/')
      ->printOutput(TRUE)
      ->printMetadata(FALSE);

    // Setting up Reporter argument to cypress-parallel task.
    if (!empty($reporter = $this->getConfigValue('tests.cypress.reporter'))) {
      $task->setReporter("$reporter");
    }

    // Setting up Reporter option argument to cypress-parallel task.
    if (!empty($reporterOption = $this->getConfigValue('tests.cypress.reporter-option'))) {
      $task->setReporterOption("$reporterOption");
    }

    // Set exit on first failing thread.
    if (!empty($bail = $this->getConfigValue('tests.cypress.bail'))) {
      $task->setBail("$bail");
    }

    // Weight file location.
    $task->setWeightFile("$this->cypressWeightFile");

    if (is_string($this->cypressTests)) {
      // setting up the test directory.
      $task->option("-d", "$this->cypressTests");
      $result = $task->run();
      if (!$result->wasSuccessful()) {
        throw new BltException("Cypress tests failed!");
      }
    }
    else {
      foreach ($this->cypressTests as $test) {
        // setting up the test directory.
        $task->option("-d", "$test");
        $result = $task->run();
        if (!$result->wasSuccessful()) {
          throw new BltException("Cypress tests failed!");
        }
      }
    }

  }
}
