<?php

namespace Drush\Commands\cgov;

use Drupal\user\Entity\Role;
use Drupal\user\Entity\User;
use Drush\Commands\DrushCommands;
use Symfony\Component\Yaml\Yaml;

/**
 * A Drush commandfile for Cgov user commands.
 */
class CgovUserCommands extends DrushCommands {

  /**
   * Changes User Information.
   *
   * This is done here because passing passwords
   * on the cmd line causes them to be logged.
   *
   * The YML file looks like:
   * ```yaml
   * admin:
   *   username: 'admin'
   *   password: 'password123'
   * ```
   *
   * @param string $usersFile
   *   Path to the yml file containing the admin information.
   *
   * @command cgov:change-admin-user
   * @aliases change-admin-user, chadm
   * @usage drush cgov:change-admin-user /tmp/drupal-users-file.yml
   *   Set the username and password of the admin user to match the yml.
   * @bootstrap full
   */
  public function changeAdminUserInfo($usersFile) {
    // @todo Relative file paths do not work here. Make them work.
    if (!file_exists($usersFile)) {
      throw new \Exception(dt('Unable to load file !file.', ['!file' => $usersFile]));
    }

    // Load Config File.
    $userConfig = Yaml::parse(file_get_contents($usersFile));

    if (!array_key_exists('admin', $userConfig)) {
      $this->logger->warning('Admin key missing from configuration');
      return;
    }

    if (!$this->isAdminValid($userConfig['admin'])) {
      $this->blockAdminUser();
      $this->logger->debug('Admin has been blocked.');
      throw new \Exception(dt('Invalid config !file.', ['!file' => $usersFile]));
    }

    $user = $userConfig['admin']['username'];
    $pass = $userConfig['admin']['password'];
    $this->resetAdmin($user, $pass);
    if ($userConfig['admin']['enabled'] === TRUE) {
      $this->unblockAdminUser();
    }
    else {
      $this->blockAdminUser();
      $this->logger->debug('Admin has been blocked.');
    }
  }

  /**
   * Block Admin User.
   *
   * No matter what the user 1 name is, it will
   * be blocked.
   *
   * @command cgov:block-admin-user
   * @aliases block-admin-user, blkadm
   * @usage drush cgov:block-admin-user
   *   Block the admin user (user 1).
   * @bootstrap full
   */
  public function blockAdminUser() {

    /** @var \Drupal\user\Entity\User $account */
    if ($account = User::load(1)) {
      $account->block();
      $account->save();
    }
    else {
      throw new \Exception(dt('Unable to load user 1.'));
    }

  }

  /**
   * UnBlock Admin User.
   *
   * @command cgov:unblock-admin-user
   * @aliases unblock-admin-user, ublkadm
   * @usage drush cgov:unblock-admin-user
   *   UnBlock the admin user (user 1).
   * @bootstrap full
   */
  public function unblockAdminUser() {
    /** @var \Drupal\user\Entity\User $account */
    if ($account = User::load(1)) {
      $account->activate();
      $account->save();
      if (\Drupal::moduleHandler()->moduleExists('externalauth')) {
        // Unlink saml for admin user.
        \Drupal::database()->delete('authmap')
          ->condition('uid', (int) $account->id())
          ->condition('provider', 'samlauth')
          ->execute();
      }
    }
    else {
      throw new \Exception(dt('Unable to load user 1.'));
    }

  }

  /**
   * Checks if the admin block is valid.
   *
   * @param mixed $admin
   *   The admin block from the yaml.
   *
   * @return bool
   *   TRUE if valid, FALSE if not.
   */
  protected function isAdminValid($admin) {
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
   * Actual function to change admin user and pass.
   *
   * @param string $username
   *   Username.
   * @param string $password
   *   Password.
   */
  protected function resetAdmin($username, $password) {
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

  /**
   * Bulk loads users based on an input file.
   *
   * This is done here because calling create user multiple
   * times outside of drush is DOG SLOW.
   *
   * The YML file looks like:
   * ```yaml
   * additional_users:
   *   - username: 'author'
   *     password: 'password123'
   *     roles:
   *       - 'content_author'
   *   - username: 'editor'
   *     password: 'password123'
   *     roles:
   *       - 'content_author'
   *       - 'content_editor'
   * ```
   *
   * @param string $usersFile
   *   Path to the yml file containing the user information.
   *
   * @command cgov:bulk-load-users
   * @aliases bulk-load-users, cgblu
   * @usage drush cgov:bulk-load-users /tmp/drupal-users-file.yml
   *   Loads up all the users in the yml file.
   * @bootstrap full
   */
  public function bulkLoadUsers($usersFile) {

    // @todo Relative file paths do not work here. Make them work.
    if (!file_exists($usersFile)) {
      throw new \Exception(dt('Unable to load file !file.', ['!file' => $usersFile]));
    }

    // Load Config File.
    $userConfig = Yaml::parse(file_get_contents($usersFile));

    if (!$this->isUserConfigValid($userConfig)) {
      throw new \Exception(dt('Invalid config !file.', ['!file' => $usersFile]));
    }

    // Load the users.
    foreach ($userConfig['additional_users'] as $user) {
      $this->loadAdditionalUser($user);
    }
  }

  /**
   * Validates the config for bulk loading users.
   *
   * @param mixed $userConfig
   *   The user config object.
   *
   * @return bool
   *   TRUE if the config is valid, FALSE if not.
   */
  protected function isUserConfigValid($userConfig) {

    if (!array_key_exists("additional_users", $userConfig)) {
      $this->logger->error("Invalid configuration - missing additional_users.");
      return FALSE;
    }

    $isValid = TRUE;

    // Go get the roles in the system.
    $role_objects = Role::loadMultiple();
    $system_roles = array_keys(
      array_combine(
        array_keys($role_objects),
        array_map(
          function ($a) {
            return $a->label();
          },
          $role_objects
        )
      )
    );

    foreach ($userConfig['additional_users'] as $idx => $user) {
      if (!$this->isAdditionalUserValid($user, $system_roles)) {
        $isValid = FALSE;
        $this->logger->error(dt("Invalid configuration - user !idx is malformed.", ['!idx' => $idx]));
      }
    }

    return $isValid;
  }

  /**
   * Validates the additional user block for loading users.
   *
   * @param mixed $user
   *   The associative array of the user.
   * @param mixed $system_roles
   *   The list of roles in the system.
   *
   * @return bool
   *   TRUE if valid, FALSE if not.
   */
  protected function isAdditionalUserValid($user, $system_roles) {

    $isValid = TRUE;

    // @todo This should be more robust and check bad chars.
    // Password is optional, so not going to check it.
    // Saml is optional too, so not going to check it.
    $isValid = (
      array_key_exists('username', $user) &&
      $user['username'] != '' &&
      array_key_exists('roles', $user) &&
      count($user['roles']) > 0
    );

    if (!$isValid) {
      return FALSE;
    }

    foreach ($user['roles'] as $role) {
      if (!in_array($role, $system_roles)) {
        $isValid = FALSE;
        $this->logger->error(dt(
          'Role !role does not exist for user, !user .',
          [
            '!role' => $role,
            '!user' => $user['username'],
          ]
        ));
      }
    }

    return $isValid;
  }

  /**
   * Creates/updates the users int the additional user block.
   *
   * @param mixed $user
   *   The associative array of the user.
   */
  protected function loadAdditionalUser($user) {
    $name = $user['username'];

    // ACSF users should only use SSO, no passwords.
    if (array_key_exists('password', $user)) {
      $pwd = $user['password'];
    }
    else {
      $pwd = NULL;
    }
    $preferred_admin_langcode = NULL;
    if (array_key_exists('preferred_admin_langcode', $user) && !empty(trim($user['preferred_admin_langcode']))) {
      $preferred_admin_langcode = trim($user['preferred_admin_langcode']);
    }

    if (array_key_exists('saml', $user) && is_bool($user['saml'])) {
      $saml = $user['saml'];
    }
    else {
      $saml = TRUE;
    }

    $account = user_load_by_name($name);

    $isNew = TRUE;

    if ($account) {
      $isNew = FALSE;
      // Update the existing account.
      $this->logger->warning(dt('User !user exists already. Updating...', ['!user' => $name]));
      $account->setpassword($pwd);
      if ($preferred_admin_langcode !== NULL) {
        $account->set('preferred_admin_langcode', $preferred_admin_langcode);
      }
      $account->activate();
    }
    else {
      $new_user = [
        'name' => $name,
        'pass' => $pwd,
        'access' => '0',
        'status' => 1,
      ];
      if ($preferred_admin_langcode !== NULL) {
        $new_user['preferred_admin_langcode'] = $preferred_admin_langcode;
      }
      $account = User::create($new_user);

      if (!$account) {
        throw new \Exception(dt('Could not create a new user account with the name !name', ['!name' => $name]));
      }
    }

    // Add Roles.
    foreach ($user['roles'] as $role) {
      $account->addRole($role);
    }

    $account->save();

    // If external authentication is available, set the user up to use it.
    if (\Drupal::hasService('externalauth.externalauth') &&
      \Drupal::moduleHandler()->moduleExists('samlauth') &&
      $saml !== FALSE) {
      $externalauth = \Drupal::service('externalauth.externalauth');
      $externalauth->linkExistingAccount($name, 'samlauth', $account);
    }

    if ($isNew) {
      $this->logger()->success(dt(
        'Created a new user !name with uid !uid',
        [
          '!name' => $name,
          '!uid' => $account->id(),
        ]
      ));
    }
    else {
      $this->logger()->success(dt(
        'Updated user !name with uid !uid',
        [
          '!name' => $name,
          '!uid' => $account->id(),
        ]
      ));
    }
  }

}
