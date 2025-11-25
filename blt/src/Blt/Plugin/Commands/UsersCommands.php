<?php

namespace Cgov\Blt\Plugin\Commands;

use Acquia\Blt\Robo\BltTasks;
use Symfony\Component\Yaml\Yaml;

/**
 * Handle cgov user tasks.
 */
class UsersCommands extends BltTasks {

  /**
   * Create Users based on a configuration file.
   *
   * This requires the blt.yml file to have they cgov.drupal_users_file
   * key. It does not require any other parameters.
   *
   * @command cgov:user:load-all
   */
  public function loadUsers() {
    $users_file_path = $this->getConfigValue('cgov.drupal_users_file');

    if (!file_exists($users_file_path)) {
      // We should warn here and exit, but not throw.
      $this->logger->warning("Skipping user load. $users_file_path not found.");
      return;
    }

    $userConfig = Yaml::parse(file_get_contents($users_file_path)) ?? [];

    if ($userConfig === NULL || $userConfig === []) {
      $this->logger->warning("Skipping user load. $users_file_path was empty.");
    }

    $commands = [];
    $blocked_admin = [
      'cgov:meo:block-admin' => [],
    ];
    if (array_key_exists('admin', $userConfig)) {
      if ($this->isAdminBlockValid($userConfig['admin'])) {
        if ($userConfig['admin']['enabled'] === TRUE) {
          $commands['cgov:user:reset-admin'] = [
            'users_file_path' => $users_file_path,
          ];
        }
        else {
          $commands = $blocked_admin;
          $this->logger->info("Admin user is not explicitly enabled and has been blocked.");
        }
      }
      else {
        $commands = $blocked_admin;
        $this->logger->warning("Skipping admin user. You must provide both the username and password and set enable to either true or false.");
      }
    }
    else {
      $commands = $blocked_admin;
      $this->logger->info("No admin user provided so admin user has been blocked.");
    }

    if (array_key_exists("additional_users", $userConfig)) {
      $commands['cgov:user:load-additional'] = [
        'users_file_path' => $users_file_path,
      ];
    }

    $this->invokeCommands($commands);
  }

  /**
   * Validates the admin block for loading users.
   *
   * @param mixed $admin
   *   The associative array of the admin block.
   *
   * @return bool
   *   TRUE if valid, FALSE if not.
   */
  protected function isAdminBlockValid($admin) {
    // @todo This should be more robust and check bad chars.
    // Validate username and password.
    $userAndPasswordValid = FALSE;
    if (array_key_exists('username', $admin) &&
        $admin['username'] != '' &&
        array_key_exists('password', $admin) &&
        $admin['password'] != '') {
      $userAndPasswordValid = TRUE;
    }

    // If present, the enabled key must be boolean.
    // It is also valid if the key is absent.
    $enabledSectionValid = FALSE;
    if (array_key_exists('enabled', $admin) && is_bool($admin['enabled'])) {
      $enabledSectionValid = TRUE;
    }
    elseif (!array_key_exists('enabled', $admin)) {
      $enabledSectionValid = TRUE;
    }

    return $userAndPasswordValid && $enabledSectionValid;
  }

  /**
   * Loads additional users into the system with roles.
   *
   * @param mixed $users_file_path
   *   The associative array of the user.
   *
   * @command cgov:user:load-additional
   */
  public function loadAdditionalUsers($users_file_path) {
    $task = $this->taskDrush()
      ->drush('bulk-load-users')
      ->rawArg($users_file_path)
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

  /**
   * Resets the user 1 username and password.
   *
   * @param mixed $users_file_path
   *   The associative array of the user.
   *
   * @command cgov:user:reset-admin
   */
  public function resetAdmin($users_file_path) {
    $task = $this->taskDrush()
      ->drush('change-admin-user')
      ->rawArg($users_file_path)
      ->printOutput(TRUE);
    $result = $task->interactive($this->input()->isInteractive())->run();
    return $result;
  }

}
