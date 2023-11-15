<?php

namespace Drupal\Tests\cgov_saml_auth_config\Functional;

use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\Tests\BrowserTestBase;
use Drupal\user\Entity\Role;

/**
 * Tests user form alterations.
 *
 * @group cgov_saml_auth_config
 */
class CgovSamlAuthConfigTest extends BrowserTestBase {

  /**
   * Use our own profile instead of the default.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * The theme to use with this test.
   *
   * @var string
   */
  protected $defaultTheme = 'cgov_common';

  /**
   * An admin user for testing.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $adminUser;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    // Install Drupal.
    parent::setUp();

    // Create an admin user.
    $this->adminUser = $this->drupalCreateUser([
      'administer site configuration',
      'administer users',
      'access administration pages',
    ]);
    $this->adminUser->addRole(Role::load('administrator'));
    $this->adminUser->save();
  }

  /**
   * Tests user registration form alterations.
   */
  public function testUserFormAlterations() {
    // Log in as the admin user.
    $this->drupalLogin($this->adminUser);

    // Visit the user add form.
    $this->drupalGet('admin/people/create');

    // Check if the password field is not present.
    $this->assertSession()->fieldNotExists('pass[pass1]');
    $this->assertSession()->fieldNotExists('pass[pass2]');

    // Submit the user registration form.
    $edit = [
      'name' => $this->randomMachineName(),
    ];
    $this->submitForm($edit, 'Create new account');

    // Check if an entry was added to the externalauth table.
    $externalauth = \Drupal::service('externalauth.externalauth');
    $addedEntry = $externalauth->load($edit['name'], 'samlauth');
    $this->assertNotNull($addedEntry, 'Entry was added to the externalauth table.');

    // Get the new user's ID.
    $user = user_load_by_name($edit['name']);
    $uid = $user->id();

    // Visit the user edit form.
    $this->drupalGet(sprintf('user/%s/edit', $uid));

    // Check if the password field is not present.
    $this->assertSession()->fieldNotExists('pass[pass1]');
    $this->assertSession()->fieldNotExists('pass[pass2]');

    // Delete the authmap entry to test re-adding it.
    \Drupal::database()->delete('authmap')
      ->condition('authname', $edit['name'])
      ->execute();

    // Submit the edit form.
    $this->submitForm([], 'Save');

    // Check if an entry was added to the externalauth table.
    $editedEntry = $externalauth->load($edit['name'], 'samlauth');
    $this->assertNotNull($editedEntry, 'Entry was added to the externalauth table.');

  }

}
