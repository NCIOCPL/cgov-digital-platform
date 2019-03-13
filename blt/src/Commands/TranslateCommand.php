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
   * @command custom:locales:translate
   */
  public function translateAll() {
    $commands = [
      'custom:locales:check' => [],
      'custom:locales:update' => [],
    ];
    $this->invokeCommands($commands);
  }

  /**
   * Check all locales.
   *
   * @command custom:locales:check
   */
  public function localeCheck() {
    $this->say("********* Check all available locales **********");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $task = $this->taskDrush()
      ->drush('locale:check')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

  /**
   * Update all locales.
   *
   * @command custom:locales:update
   */
  public function localeUpdate() {
    $this->say("********* Update all available locales **********");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $task = $this->taskDrush()
      ->drush('locale:update')
      ->rawArg('&& drush cr')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
