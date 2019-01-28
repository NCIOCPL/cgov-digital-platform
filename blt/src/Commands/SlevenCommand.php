<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * A library of convenience commands.
 */
class SlevenCommand extends BltTasks {

  /**
   * Reinstalls a web site.
   *
   * @command cgov:reinstall
   */
  public function reinstall() {

    $commands = [
      'drupal:install' => [],
      'drupal:toggle:modules' => [],
      'cgov:user:load-all' => [],
      'custom:install_cgov_yaml_content_by_module' => [
        'module' => 'cgov_yaml_content',
      ],
    ];

    $this->invokeCommands($commands);
  }

}
