<?php

namespace Drupal\Tests\cgov_site\Functional;


use Drupal\Component\Utility\Html;
use Drupal\media\Entity\MediaType;
use Drupal\Tests\SchemaCheckTestTrait;
use Drupal\contact\Entity\ContactForm;
use Drupal\Core\Url;
use Drupal\dynamic_page_cache\EventSubscriber\DynamicPageCacheSubscriber;
use Drupal\filter\Entity\FilterFormat;
use Drupal\Tests\BrowserTestBase;
use Drupal\user\Entity\Role;
use Drupal\Tests\system\Functional\Module;

/**
 * Tests Standard installation profile expectations.
 *
 * @group cgov
 * @group cgov_site
 *
 */
class CgovSiteTest extends BrowserTestBase
{

  use SchemaCheckTestTrait;

  protected $profile = 'cgov_site';

  /**
   * The admin user.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $adminUser;

  /**
   * Tests cgov_site installation profile.
   *
   */
  public function testCgovSiteProfile()
  {
    // Verify Home page loads for anonymous user.
    $this->drupalGet('<front>');
    $this->assertResponse(200);

    // Create admin user and login.
    $this->adminUser = $this->drupalCreateUser([
      'administer blocks',
      'administer themes',
      'access administration pages',
      'view the administration theme',
    ]);
    $this->drupalLogin($this->adminUser);

    // Load Appearance (themes) page.
    $this->drupalGet('admin/appearance');
    // Verify we have permission to view page
    $this->assertResponse(200);

    // Verify local tasks (tabs) menu items are present.
    $this->assertSession()->elementContains('css', '.block-local-tasks-block', 'List');
    $this->assertSession()->elementContains('css', '.block-local-tasks-block', 'Settings');

    // Verify enabled themes.
    $this->assertSession()->elementContains('css', '.system-themes-list-installed', 'CGov Common Base Theme');
    $this->assertSession()->elementContains('css', '.system-themes-list-installed', 'CGov Admin Theme');
    $this->assertSession()->elementContains('css', '.system-themes-list-installed', 'Seven');
  }

}


