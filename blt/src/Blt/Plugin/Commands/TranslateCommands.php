<?php

namespace Cgov\Blt\Plugin\Commands;

use Acquia\Blt\Robo\BltTasks;

/**
 * Handle importing default yaml content.
 */
class TranslateCommands extends BltTasks {

  /**
   * Translate strings for all available locales.
   *
   * @command cgov:locales:translate
   */
  public function translateAll() {
    $commands = [
      'cgov:locales:check' => [],
      'cgov:locales:update' => [],
    ];
    $this->invokeCommands($commands);
  }

  /**
   * Checks for available translation updates.
   *
   * @command cgov:locales:check
   */
  public function localeCheck() {
    $this->say("=======================================");
    $this->say("=== Check for all available locales! ==");
    $this->say("=======================================");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $task = $this->taskDrush()
      ->drush('locale:check')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

  /**
   * Import the available translation updates.
   *
   * @command cgov:locales:update
   */
  public function localeUpdate() {
    $this->say("=====================================");
    $this->say("=== Update all available locales! ===");
    $this->say("=====================================");
    /** @var \Acquia\Blt\Robo\Tasks\DrushTask $task */
    $docroot = $this->getConfigValue('docroot');
    $task = $this->taskDrush()
      ->drush('locale:update')
      // Force a re-import of our translations.
      ->drush("locale:import es {$docroot}/profiles/custom/cgov_site/translations/cgov_site.es.po")
      ->drush('cr')
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
