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
   * Use the frontend theme that renders the customized login form.
   *
   * @var string
   */
  protected $defaultTheme = 'ncids_trans';

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

  /**
   * Tests that missing credentials display the generic login error.
   */
  public function testMissingCredentialsLoginError(): void {
    // Cover both fields empty and each field missing independently.
    $submissions = [
      [],
      ['name' => $this->randomMachineName()],
      ['pass' => $this->randomString()],
    ];

    foreach ($submissions as $submission) {
      $this->drupalGet('user/login', [
        'query' => ['show_login_fields' => 'true'],
      ]);
      $this->assertSession()->elementAttributeExists('css', 'form.usa-form', 'novalidate');
      $this->submitForm($submission, 'Log in');

      $this->assertSession()->pageTextContains('Unrecognized username or password.');
      $this->assertSession()->elementAttributeContains('css', 'input[name="name"]', 'class', 'usa-input--error');
      $this->assertSession()->elementAttributeContains('css', 'input[name="name"]', 'aria-describedby', 'edit-name--error');
      $this->assertSession()->elementAttributeExists('css', 'input[name="name"]', 'autofocus');
      $this->assertSession()->elementExists('css', '#edit-name--error.usa-error-message');
      $this->assertSession()->pageTextNotContains('Username field is required.');
      $this->assertSession()->pageTextNotContains('Password field is required.');
    }
  }

}
