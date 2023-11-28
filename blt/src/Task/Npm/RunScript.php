<?php

namespace Cgov\Task\Npm;

use Robo\Contract\CommandInterface;
use Robo\Exception\TaskException;
use Robo\Task\Npm\Base;

/**
 * Implementation of the missing 'npm run-script' command..
 *
 * @package Cgov\Task\Npm
 */
class RunScript extends Base implements CommandInterface {

  /**
   * {@inheritDoc}
   */
  protected $action = 'run-script';

  /**
   * Name of the script to execute.
   *
   * @var string
   */
  protected $scriptName = NULL;

  /**
   * An array of arguments to be passed to the script.
   *
   * @var array
   */
  protected $scriptArguments = [];

  /**
   * Has the command been assembled already?
   *
   * @var bool
   */
  protected $built = FALSE;

  /**
   * Set the name of the script to be executed.
   *
   * @param mixed $scriptName
   *   Name of the script to execute.
   *
   * @return $this
   *   Instance of the task.
   */
  public function scriptName($scriptName) {

    if (empty($scriptName)) {
      throw new TaskException(__CLASS__, '$scriptname not specified.');
    }

    $this->scriptName = $scriptName;
    return $this;
  }

  /**
   * Pass an argument to the script.
   *
   * @param string $args
   *   The argument to passed.
   *
   * @return $this
   *   Instance of the task.
   */
  public function scriptArg($args) {
    return $this->scriptArgs($args);
  }

  /**
   * Passes the functions arguments to the script.
   *
   * @param string $args
   *   The arguments to passed.
   *
   * @return $this
   *   Instance of the task.
   */
  public function scriptArgs($args) {
    $func_args = func_get_args();
    if (!is_array($args)) {
      $args = $func_args;
    }

    $this->scriptArguments = array_merge($this->scriptArguments, $args);
    return $this;
  }

  /**
   * Set up the command line arguments in the correct order.
   */
  public function buildCommand() {
    if (empty($this->scriptName)) {
      throw new TaskException(__CLASS__, '$scriptname not specified.');
    }

    $this->arg($this->scriptName);

    // Required separator to note the start of script arguments.
    $this->arg('--');
    foreach ($this->scriptArguments as $argument) {
      $this->rawArg($argument);
    }

  }

  /**
   * {@inheritDoc}
   */
  public function getCommand() {
    if (!$this->built) {
      $this->buildCommand();
      $this->built = TRUE;
    }
    return "{$this->command}  {$this->action}{$this->arguments}";
  }

  /**
   * {@inheritDoc}
   */
  public function run() {
    $this->printTaskInfo('Run NPM script: {arguments}', ['arguments' => $this->arguments]);
    return $this->executeCommand($this->getCommand());
  }

}
