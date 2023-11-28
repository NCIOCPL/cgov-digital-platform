<?php

namespace Cgov\Blt\Plugin\Commands;

use Acquia\Blt\Robo\Commands\Tests\TestsCommandBase;

/**
 * Commands for managing Xvfb.
 */
class XvfbCommands extends TestsCommandBase {
  /**
   * The standard port number used by Xvfb.
   *
   * @var int
   */
  private const XVFB_PORT = 99;

  /**
   * Process ID for the running instance of Xvfb.
   *
   * @var int
   */
  private $xvfbPid = -9999;

  /**
   * Hook method to start Xvfb.
   *
   * @hook pre-command @launchXvfb
   */
  public function startXvfbHook() {
    $this->invokeCommand('tests:xvfb:start');
  }

  /**
   * Hook method to shut down Xvfb.
   *
   * @hook post-command @launchXvfb
   */
  public function killXvfbHook() {
    $this->invokeCommand('tests:xvfb:kill');
  }

  /**
   * Starts Xvfb.
   *
   * @command tests:xvfb:start
   */
  public function startXvfb() {

    $port = XvfbCommands::XVFB_PORT;
    putenv("DISPLAY=$port");
    $xvfbCommand = "nohup Xvfb :$port > /dev/null 2>&1 & echo $!";
    $pid = shell_exec($xvfbCommand);
    $this->xvfbPid = trim($pid);

    // Wait for Xvfb to start.
    // Hack via https://unix.stackexchange.com/a/310688/223606
    $command = "while [ ! -e /tmp/.X11-unix/X$port ]; do sleep 0.1; done";
    shell_exec($command);

  }

  /**
   * Shuts down Xvfb.
   *
   * @command tests:xvfb:kill
   */
  public function killXvfb() {
    exec("kill $this->xvfbPid");
  }

}
