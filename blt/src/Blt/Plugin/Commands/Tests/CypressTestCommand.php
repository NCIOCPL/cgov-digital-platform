<?php

namespace Cgov\Blt\Plugin\Commands\Tests;

use Acquia\Blt\Robo\BltTasks;
use Acquia\Blt\Robo\Commands\Tests\TestsCommandBase;
use Acquia\Blt\Robo\Exceptions\BltException;

/**
 * Defines commands in the "tests" namespace.
 */
class CypressTestCommand extends TestsCommandBase {

  /**
   * The directory containing Cypress reports.
   *
   * @var string
   */
  protected $cypressLogDir;

  /**
   * This hook will fire for all commands in this command file.
   *
   * @hook init
   */
  public function initialize() {
    parent::initialize();
    $this->cypressLogDir = $this->getConfigValue('tests.reports.localDir') . "/cypress";
  }  

  /**
   * Entrypoint for running cypress tests.
   *
   * @command tests:cypress:run
   * @description Executes all cypress tests. This optionally launch Selenium
   *   prior to execution.
   * @usage
   *   Executes all configured tests.
   * @usage -D tests.cypress.paths=${PWD}/tests/cypress/features/Examples.feature
   *   Executes scenarios in the Examples.feature file.
   * @usage -D tests.cypress.paths=ContentCreationParallel/Examples.feature:4
   *   Executes only the scenario on line 4 of Examples.feature.
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

    // Log config for debugging purposes.
    $this->logConfig($this->getConfigValue('tests.cypress'), 'cypress');

    // This we don't know
    $this->logConfig($this->getInspector()->getLocalBehatConfig()->export());

    // Create test reports folder if it does not exist already.
    $this->createReportsDir();

    try {
      $this->executeCypressTests();
    }
    catch (\Exception $e) {
      throw $e;
    }
  }

    /**
   * Run Drupal checks.
   *
   * @param string $type
   *   Type of check (module or theme).
   *
   * @throws \Acquia\Blt\Robo\Exceptions\BltException
   * @throws \Robo\Exception\TaskException
   */
  public function runCypress($path) {
    $this->say("Running cypress-parallel against $path");
    $bin = $this->getConfigValue('composer.bin'); // This should be ${repo.root}/tests/cypress/node_modules/bin
    $docroot = $this->getConfigValue('docroot');
    $result = $this->taskExecStack()
      ->dir($this->getConfigValue('repo.root'))
      ->exec("$bin/cypress -d '$path/*''")
      ->run();
    $exit_code = $result->getExitCode();
    if ($exit_code) {
      $this->logger->notice('Review Deprecation warnings and re-run.');
      throw new BltException("Drupal Check in docroot/$type/custom failed.");
    }
  }

  /**
   * Executes all behat tests in behat.paths configuration array.
   *
   * @throws \Exception
   *   Throws an exception if any Behat test fails.
   */
  protected function executeCypressTests() {
    $cypress_paths = $this->getConfigValue('tests.cypress.paths');
    if (is_string($cypress_paths)) {
      $cypress_paths = [$cypress_paths];
    }

    foreach ($cypress_paths as $path) {
      // If we do not have an absolute path, we assume that the behat feature
      // path is relative to tests/behat/features.
      if (!$this->getInspector()->getFs()->isAbsolutePath($path)) {
        $path = $this->getConfigValue('repo.root') . '/tests/cypress/cypress/e2e/' . $path;
      }
      // Output errors.
      // @todo replace base_url in behat config when internal server is being used.
      $task = $this->taskCypress($this->getConfigValue('composer.bin') . '/behat')
        ->format('pretty')
        ->arg($path)
        ->option('colors')
        ->noInteraction()
        ->printMetadata(FALSE)
        ->stopOnFail()
        ->option('strict')
        ->interactive($this->input()->isInteractive());

      if ($this->output()->getVerbosity() >= OutputInterface::VERBOSITY_NORMAL) {
        $task->verbose();
      }

      $result = $task->run();

      if (!$result->wasSuccessful()) {
        throw new BltException("Cypress tests failed!");
      }
    }
  }
}
