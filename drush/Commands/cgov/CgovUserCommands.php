<?php

namespace Drush\Commands\cgov;

use Drupal\user\Entity\User;
use Drush\Commands\DrushCommands;

/**
 * A Drush commandfile for Cgov user commands.
 */
class CgovUserCommands extends DrushCommands {

  /**
   * Changes User Information.
   *
   * Use this to change the admin user's name and password.
   *
   * @param string $username
   *   The new username.
   * @param string $password
   *   The new password.
   *
   * @command cgov:change-admin-user
   * @aliases change-admin-user, chadm
   * @usage drush cgov:change-admin-user newadmin "correct horse battery staple"
   *   Set the username of the admin user to newadmin with a new password.
   * @bootstrap full
   */
  public function changeAdminUserInfo($username, $password) {
    /** @var \Drupal\user\Entity\User $account */
    if ($account = User::load(1)) {
      if ($username) {
        $account->setUsername($username);
      }
      if ($password) {
        $account->setpassword($password);
      }
      $account->save();
      $this->logger()->success(dt('Changed username and password for user 1'));
    }
    else {
      throw new \Exception(dt('Unable to load user 1.'));
    }
  }

}
