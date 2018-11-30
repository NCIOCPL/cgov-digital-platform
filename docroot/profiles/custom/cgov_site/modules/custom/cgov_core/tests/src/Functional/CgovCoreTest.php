<?php

namespace Drupal\Tests\cgov_site\Functional;

use Drupal\Tests\SchemaCheckTestTrait;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests CGOV_SITE installation profile expectations are being met.
 *
 * @group cgov
 * @group cgov_site
 */
class CgovCoreTest extends BrowserTestBase {

  use SchemaCheckTestTrait;

  protected $profile = 'cgov_site';

  /**
   * The admin user.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $adminUser;
  protected $contentAuthorUser;
  protected $contentEditorUser;
  protected $layoutManagerUser;
  protected $siteManagerUser;

  /**
   * Tests cgov_site installation profile.
   */
  public function testCgovSiteProfile() {
    // Verify all basic roles exist.
    $roles = user_roles();
    $this->assertArrayHasKey('anonymous', $roles, 'Anonymous role exists.');
    $this->assertArrayHasKey('authenticated', $roles, 'Authenticated role exists.');
    $this->assertArrayHasKey('administrator', $roles, 'Administrator role exists.');
    $this->assertArrayHasKey('content_author', $roles, 'Content Author role exists.');
    $this->assertArrayHasKey('content_editor', $roles, 'Content Editor role exists.');
    $this->assertArrayHasKey('layout_manager', $roles, 'Layout Manager role exists.');
    $this->assertArrayHasKey('site_admin', $roles, 'Site Admin role exists.');

    // Create Content Author user and login.
    $this->contentAuthorUser = $this->drupalCreateUser();
    $this->contentAuthorUser->addRole('content_author');
    $this->contentAuthorUser->save();
    $this->drupalLogin($this->contentAuthorUser);
    // Try to add an Article (should succeed).
    $this->drupalGet('/node/add/cgov_article');
    // Verify we have permission to view page.
    $this->assertResponse(200);
    // Try to add a Landing page (should fail).
    $this->drupalGet('/node/add/cgov_home_landing');
    // Verify we do not have permission to view page.
    $this->assertResponse(403);
    // Logout.
    $this->drupalLogout();

    // Create Content Editor user and login.
    $this->contentEditorUser = $this->drupalCreateUser();
    $this->contentEditorUser->addRole('content_editor');
    $this->contentEditorUser->save();
    $this->drupalLogin($this->contentEditorUser);
    // Try to add an Article (should succeed).
    $this->drupalGet('/node/add/cgov_article');
    // Verify we have permission to view page.
    $this->assertResponse(200);
    // Try to add a Landing page (should fail).
    $this->drupalGet('/node/add/cgov_home_landing');
    // Verify we do not have permission to view page.
    $this->assertResponse(403);
    // Logout.
    $this->drupalLogout();

    // Create Layout Manager user and login.
    $this->layoutManagerUser = $this->drupalCreateUser();
    $this->layoutManagerUser->addRole('layout_manager');
    $this->layoutManagerUser->save();
    $this->drupalLogin($this->layoutManagerUser);
    // Try to add an Article (should succeed).
    $this->drupalGet('/node/add/cgov_article');
    // Verify we have permission to view page.
    $this->assertResponse(403);
    // Try to add a Landing page (should fail).
    $this->drupalGet('/node/add/cgov_home_landing');
    // Verify we do not have permission to view page.
    $this->assertResponse(200);
    // Logout.
    $this->drupalLogout();

    // Create Site Admin user and login.
    $this->siteAdminUser = $this->drupalCreateUser();
    $this->siteAdminUser->addRole('site_admin');
    $this->siteAdminUser->save();
    $this->drupalLogin($this->siteAdminUser);
    // Try to add an Article (should succeed).
    $this->drupalGet('/node/add/cgov_article');
    // Verify we have permission to view page.
    $this->assertResponse(403);
    // Try to add a Landing page (should fail).
    $this->drupalGet('/node/add/cgov_home_landing');
    // Verify we do not have permission to view page.
    $this->assertResponse(403);
    // Logout.
    $this->drupalLogout();

  }

}
