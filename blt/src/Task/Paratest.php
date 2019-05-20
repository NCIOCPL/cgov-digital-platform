<?php

namespace Acquia\Blt\Custom\Task;

use Robo\Contract\CommandInterface;
use Robo\Contract\PrintedInterface;
use Robo\Task\BaseTask;
use Robo\Exception\TaskException;

/**
 * Runs Paratest (PHPUnit) tests.
 *
 * ``` php
 * <?php
 * $this->taskParatest()
 *  ->group('core')
 *  ->bootstrap('test/bootstrap.php')
 *  ->run()
 *
 * ?>
 * ```
 */
class Paratest extends BaseTask implements CommandInterface, PrintedInterface {
  use \Robo\Common\ExecOneCommand;

  /**
   * Command variable.
   *
   * @var string
   */
  protected $command;

  /**
   * Directory of test files or single test file to run.
   *
   * @var string
   */
  protected $files = '';

  /**
   * Paratest constructor.
   *
   * @param string $pathToParatest
   *   Path to paratest.
   *
   * @throws \Robo\Exception\TaskException
   */
  public function __construct($pathToParatest = NULL) {
    $this->command = $pathToParatest;
    if (!$this->command) {
      $this->command = $this->findExecutablePhar('paratest');
    }
    if (!$this->command) {
      throw new TaskException(__CLASS__, "Neither local paratest nor global composer installation not found");
    }
  }

  /**
   * Add a filter to command.
   *
   * @param string $filter
   *   Filter to add.
   *
   * @return $this
   */
  public function filter($filter) {
    $this->option('filter', $filter);
    return $this;
  }

  /**
   * Add a group to command.
   *
   * @param string $group
   *   Group to add.
   *
   * @return $this
   */
  public function group($group) {
    $this->option("group", $group);
    return $this;
  }

  /**
   * Exclude Group param.
   *
   * @param string $group
   *   Group to add.
   *
   * @return $this
   */
  public function excludeGroup($group) {
    $this->option("exclude-group", $group);
    return $this;
  }

  /**
   * Adds `log-junit` option.
   *
   * @param string $file
   *   JUnit file.
   *
   * @return $this
   */
  public function xml($file = NULL) {
    $this->option("log-junit", $file);
    return $this;
  }

  /**
   * Adds bootstrap option.
   *
   * @param string $file
   *   File param.
   *
   * @return $this
   */
  public function bootstrap($file) {
    $this->option("bootstrap", $file);
    return $this;
  }

  /**
   * Adds config file.
   *
   * @param string $file
   *   Config file.
   *
   * @return $this
   */
  public function configFile($file) {
    $this->option('-c', $file);
    return $this;
  }

  /**
   * Directory of test files or single test file to run.
   *
   * @param string $files
   *   A single test file or a directory containing test files.
   *
   * @return $this
   *   Returns object.
   *
   * @throws \Robo\Exception\TaskException
   */
  public function files($files) {
    if (!empty($this->files) || is_array($files)) {
      throw new TaskException(__CLASS__, "Only one file or directory may be provided.");
    }
    $this->files = ' ' . $files;

    return $this;
  }

  /**
   * Test the provided file.
   *
   * @param string $file
   *   Path to file to test.
   *
   * @return $this
   */
  public function file($file) {
    return $this->files($file);
  }

  /**
   * {@inheritdoc}
   */
  public function getCommand() {
    return $this->command . $this->arguments . $this->files;
  }

  /**
   * {@inheritdoc}
   */
  public function run() {
    $this->printTaskInfo('Running Paratest {arguments}', ['arguments' => $this->arguments]);
    return $this->executeCommand($this->getCommand());
  }

}
