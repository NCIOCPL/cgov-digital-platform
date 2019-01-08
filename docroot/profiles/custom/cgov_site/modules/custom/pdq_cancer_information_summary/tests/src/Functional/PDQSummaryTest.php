<?php

namespace Drupal\Tests\cgov_site\Functional;

use Drupal\Tests\SchemaCheckTestTrait;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests Functionality of the PDQ Cancer Information Summary content type.
 *
 * @group cgov
 * @group cgov_site
 */
class PDQSummaryTest extends BrowserTestBase {

  use SchemaCheckTestTrait;

  protected $profile = 'cgov_site';

  /**
   * The admin user.
   *
   * @var \Drupal\user\UserInterface
   */
  protected $adminUser;

  /*
  Set up friendly names for the various fields as the generated IDs can be
  rather confusing at first.
   */
  const PAGE_TITLE = 'edit-title-0-value';
  const SHORT_TITLE = 'edit-field-short-title-0-value';

  const SAVE_BUTTON = 'edit-submit';

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    // Create admin user and login.
    $this->adminUser = $this->drupalCreateUser();
    $this->adminUser->addRole('administrator');
    $this->adminUser->save();
    $this->drupalLogin($this->adminUser);
  }

  /**
   * Tests Adding a PDQ Summary.
   */
  public function testSummaryFieldsExist() {

    // Load new content item page.
    $this->drupalGet('node/add/pdq_cancer_information_summary');
    // Verify we have permission to view page.
    $this->assertResponse(200);

    // Verify fields exist.
    $this->assertSession()->fieldExists(PDQSummaryTest::PAGE_TITLE);
    $this->assertSession()->fieldExists(PDQSummaryTest::SHORT_TITLE);

    // Fill out the fields.
    $this->getSession()->getPage()->fillField(PDQSummaryTest::PAGE_TITLE, 'pony');
    $this->getSession()->getPage()->fillField(PDQSummaryTest::SHORT_TITLE, 'pony');

    // Submit the form and check for success.
    $this->getSession()->getPage()->pressButton(PDQSummaryTest::SAVE_BUTTON);
    $this->assertResponse(200);
  }

}
