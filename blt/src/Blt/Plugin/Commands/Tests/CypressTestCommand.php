<?php

namespace Cgov\Blt\Plugin\Commands\Tests;

use Acquia\Blt\Robo\Commands\Tests\TestsCommandBase;
use Acquia\Blt\Robo\Exceptions\BltException;
use Cgov\CgovNpmTrait;

/**
 * Defines commands in the "tests" namespace.
 */
class CypressTestCommand extends TestsCommandBase {
  use CgovNpmTrait;

  /**
   * Base directory for running cypress tests.
   * This path is relative to the repository root.∂
   *
   * @var string
   */
  protected $baseDir;

  /**
   * This hook will fire for all commands in this command file.
   *
   * @hook init
   */
  public function initialize() {
    parent::initialize();

    $this->baseDir = $this->getConfigValue("tests.cypress.basePath");
  }

  /**
   * Hook to install the needed NPM modules if not already present.
   *
   * @hook pre-command @installCheck
   */
  public function cypressSetupHook() {
    $node_modules = "$this->baseDir/node_modules";

    if (!is_dir($node_modules)) {
      $this->invokeCommand('tests:cypress:install');
    }
  }

  /**
   * Set up to run cypress tests.
   *
   * @command tests:cypress:install
   * @description Install the NPM packages needed in order to run cypress tests.
   *
   */
  public function cypressSetup() {
    // If we get tired of the amount of time it takes to do a complete clean install
    // on every run for local tests, replace this with a call to taskNpmInstall.
    $result = $this->taskNpmCleanInstall()->dir($this->baseDir)->run();
    $exit_code = $result->getExitCode();

    if($exit_code) {
      throw new BltException('Cypress npm install failed.');
    }
  }

  /**
   * Launch point for cypress tests.
   *
   * @command tests:cypress
   * @description Execute all cypress tests.
   * @usage -D tests.cypress.paths=${PWD}/tests/cypress/features/
   * @aliases cypress tests:cypress:run tcr
   *
   * @interactGenerateSettingsFiles
   * @interactInstallDrupal
   * @validateDrupalIsInstalled
   * @launchWebServer
   * @installCheck
   * @launchXvfb
   *
   * @throws \Acquia\Blt\Robo\Exceptions\BltException
   * @throws \Exception
   */
  public function cypressRunTests() {

    // Get configuration values.
    $testScript = $this->getConfigValue('tests.cypress.testScript');
    $threadCount = $this->getConfigValue('tests.cypress.num-threads');

    if(!is_string($testScript)) {
      throw new BltException('tests.cypress.pretestScript must be a string.');
    }

    if(empty($threadCount)) {
      $threadCount = 2;
    }

    // Make sure we have an array of paths.
    $testPaths = $this->getConfigValue('tests.cypress.paths');
    if(empty($testPaths)) {
      throw new BltException('tests.cypress.paths must be one or more strings.');
    }
    elseif(is_string($testPaths)) {
      $testPaths = [ $testPaths ];
    }
    elseif(!is_array($testPaths)) {
      throw new BltException('tests.cypress.paths must be one or more strings.');
    }

    foreach ($testPaths as $path) {

      $specDir = $path['specDir'];
      $weightFile = $path['weightFile'];

      $result = $this->taskNpmRunScript()
          ->scriptName($testScript)
          ->scriptArg("--thread-count $threadCount")
          ->scriptArg("--specsDir '$specDir'")
          ->scriptArg("--weightsJson '$weightFile'")
          ->dir($this->baseDir)->run();

      $exit_code = $result->getExitCode();

      if($exit_code) {
        throw new BltException('Cypress tests failed.');
      }
    }

  }

}
