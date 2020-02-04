<?php

namespace Drupal\Tests\cgov_mail\Functional;

use Drupal\Core\Url;
use Drupal\Tests\BrowserTestBase;

/**
 * Simple test to ensure that main page loads with module enabled.
 *
 * @group cgov_mail_plugin
 */
class LoadTest extends BrowserTestBase {

  /**
   * Load the CancerGov site profile.
   *
   * @var string
   */
  protected $profile = 'cgov_site';

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['cgov_mail'];

  /**
   * A user with permission to administer site configuration.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $user;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->user = $this->drupalCreateUser(['administer site configuration']);
    $this->drupalLogin($this->user);
  }

  /**
   * Tests that the home page loads with a 200 response.
   */
  public function testLoad() {
    $this->drupalGet(Url::fromRoute('<front>'));
    $this->assertSession()->statusCodeEquals(200);
  }

}
