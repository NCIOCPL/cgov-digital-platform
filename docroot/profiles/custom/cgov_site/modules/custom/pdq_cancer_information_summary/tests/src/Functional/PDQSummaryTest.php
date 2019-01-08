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
  rather confusing at first. (Note that these values are from the id attribute
  of the field's generated HTML, and are not the same as the machine_name.)
   */
  const PAGE_TITLE = 'edit-title-0-value';
  const SHORT_TITLE = 'edit-field-short-title-0-value';
  const POSTED_DATE_DATE = 'edit-field-date-posted-0-value-date';
  const POSTED_DATE_TIME = 'edit-field-date-posted-0-value-time';
  const UPDATED_DATE_DATE = 'edit-field-date-updated-0-value-date';
  const UPDATED_DATE_TIME = 'edit-field-date-updated-0-value-time';

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
    $this->assertSession()->fieldExists(PDQSummaryTest::POSTED_DATE_DATE);
    $this->assertSession()->fieldExists(PDQSummaryTest::POSTED_DATE_TIME);
    $this->assertSession()->fieldExists(PDQSummaryTest::UPDATED_DATE_DATE);
    $this->assertSession()->fieldExists(PDQSummaryTest::UPDATED_DATE_TIME);

    /*
    We need to figure out how to test filling out the form and submitting it.
    The difficulty is that no failure occurs when
    $this->getSession()->getPage()->pressButton() a client-side error occurs
    (e.g. a required field is missing).  This opens the door for errors to
    potentially be hidden.

    If a means can be determined to generically check for any client-side error
    (as opposed to an enumerated list), then the code to fill out and submit
    the form might look something like this (minus some line break shenanigans
    to get around comment-formatting limitations from PHPCS):

    // Fill out the fields.
    $this->getSession()->getPage()->
    -   fillField(PDQSummaryTest::PAGE_TITLE, 'pony');
    $this->getSession()->getPage()->
    -   fillField(PDQSummaryTest::SHORT_TITLE, 'pony');

    // Submit the form and check for success.
    $this->getSession()->getPage()->pressButton(PDQSummaryTest::SAVE_BUTTON);
    $this->drupalPostForm(NULL, )
    $this->assertResponse(200);
     */
  }

}
