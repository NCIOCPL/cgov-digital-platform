<?php

namespace Drupal\Tests\cgov_site\Functional;

use Drupal\Tests\SchemaCheckTestTrait;
use Drupal\Tests\BrowserTestBase;
use CgovPlatform\Tests\CgovSchemaExclusions;

/**
 * Tests CGOV_SITE installation profile expectations are being met.
 *
 * @group cgov
 * @group cgov_site
 */
class CgovSiteTest extends BrowserTestBase {

  use SchemaCheckTestTrait;

  protected $profile = 'cgov_site';

  /**
   * The admin user.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $adminUser;

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();
  }

  /**
   * Tests cgov_site installation profile.
   */
  public function testCgovSiteProfile() {
    // Verify all basic roles exist.
    $roles = user_roles();
    $this->assertArrayHasKey('anonymous', $roles, 'Anonymous role exists.');
    $this->assertArrayHasKey('authenticated', $roles, 'Authenticated role exists.');
    $this->assertArrayHasKey('admin_ui', $roles, 'Admin UI role exists.');
    $this->assertArrayHasKey('content_author', $roles, 'Content Author role exists.');
    $this->assertArrayHasKey('content_editor', $roles, 'Content Editor role exists.');
    $this->assertArrayHasKey('site_admin', $roles, 'Site Admin role exists.');

    // Create admin user and login.
    $this->adminUser = $this->drupalCreateUser();
    $this->adminUser->addRole('admin_ui');
    $this->adminUser->addRole('site_admin');
    $this->adminUser->save();
    $this->drupalLogin($this->adminUser);

    // Load Appearance (themes) page.
    $this->drupalGet('admin/appearance');
    // Verify we have permission to view page.
    $this->assertResponse(200);

    // Verify local tasks (tabs) menu items are present.
    $this->assertSession()->elementContains('css', '.block-local-tasks-block', 'List');
    $this->assertSession()->elementContains('css', '.block-local-tasks-block', 'Settings');

    // Verify enabled themes.
    $this->assertSession()->elementContains('css', '.system-themes-list-installed', 'CGov Common Base Theme');
    $this->assertSession()->elementContains('css', '.system-themes-list-installed', 'CGov Admin Theme');
    $this->assertSession()->elementContains('css', '.system-themes-list-installed', 'Seven');

    // Test that once the site is install English and Spanish are enabled.
    $langs = \Drupal::service('language_manager')->getLanguages();
    $this->assertArrayHasKey('en', $langs, 'English is enabled.');
    $this->assertArrayHasKey('es', $langs, 'Spanish is enabled.');

    // Test that the language negotiations are correct.
    $ifaceNegs = \Drupal::config('language.types')->get('negotiation.language_interface.enabled');
    $this->assertCount(3, array_keys($ifaceNegs), 'Only 3 interface negotiations set.');
    $this->assertArrayHasKey('language-user-admin', $ifaceNegs, 'User admin interface negotiation set.');
    $this->assertArrayHasKey('language-url', $ifaceNegs, 'Language URL interface negotiation set.');
    $this->assertArrayHasKey('language-selected', $ifaceNegs, 'Selected language interface negotiation set.');

    $contentNegs = \Drupal::config('language.types')->get('negotiation.language_content.enabled');
    $this->assertCount(2, array_keys($contentNegs), 'Only 2 content negotiations set.');
    $this->assertArrayHasKey('language-url', $contentNegs, 'URL content negotiation set.');
    $this->assertArrayHasKey('language-selected', $contentNegs, 'Selected language content negotiation set.');

  }

}
