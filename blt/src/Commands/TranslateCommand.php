<?php

namespace Acquia\Blt\Custom\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Handle importing default yaml content.
 */
class TranslateCommand extends BltTasks {

  /**
   * Translate strings for all available locales.
   *
   * @command custom:translate:all
   */
  public function translateAll() {
    $commands = [
      'custom:translate:spanish' => [],
    ];
    $this->invokeCommands($commands);
  }

  /**
   * Translate content to Spanish.
   *
   * @command custom:translate:spanish
   */
  public function translateSpanish() {
    $this->say("************************************************");
    $this->say("***** Creating translations for Spanish *****");
    $this->say("************************************************");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $task = $this->taskDrush()
      ->drush('locale:update')
      ->rawArg('--langcodes=es')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
