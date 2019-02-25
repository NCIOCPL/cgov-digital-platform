<?php

namespace Drupal\Tests\cgov_site\Functional;

use Drupal\Tests\SchemaCheckTestTrait;
use Drupal\Tests\BrowserTestBase;

/**
 * Tests Functionality of the PDQ Drug Information Summary content type.
 *
 * @group cgov
 * @group cgov_site
 */
class PDQDrugSummaryTest extends BrowserTestBase {

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
  const CDR_ID = 'edit-field-pdq-cdr-id-0-value';
  const POSTED_DATE_DATE = 'edit-field-date-posted-0-value-date';
  const UPDATED_DATE_DATE = 'edit-field-date-updated-0-value-date';
  const PUBLIC_USE = 'edit-field-public-use';
  const LIST_DESCRIPTION = 'edit-field-page-description-0-value';
  const BODY = 'edit-body-0-value';
  const URL = 'edit-field-pdq-url-0-value';

  const SAVE_BUTTON = 'edit-submit';

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    // Create admin user and login.
    $this->adminUser = $this->drupalCreateUser();
    $this->adminUser->addRole('pdq_importer');
    $this->adminUser->save();
    $this->drupalLogin($this->adminUser);
  }

  /**
   * Tests Adding a PDQ Summary.
   */
  public function testSummaryFieldsExist() {

    // Load new content item page.
    $this->drupalGet('node/add/pdq_drug_information_summary');
    // Verify we have permission to view page.
    $this->assertResponse(200);

    // Verify fields exist.
    $this->assertSession()->fieldExists(PDQDrugSummaryTest::PAGE_TITLE);
    $this->assertSession()->fieldExists(PDQDrugSummaryTest::CDR_ID);
    $this->assertSession()->fieldExists(PDQDrugSummaryTest::POSTED_DATE_DATE);
    $this->assertSession()->fieldExists(PDQDrugSummaryTest::UPDATED_DATE_DATE);
    $this->assertSession()->fieldExists(PDQDrugSummaryTest::PUBLIC_USE);
    $this->assertSession()->fieldExists(PDQDrugSummaryTest::LIST_DESCRIPTION);
    $this->assertSession()->fieldExists(PDQDrugSummaryTest::BODY);
    $this->assertSession()->fieldExists(PDQDrugSummaryTest::URL);

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
    -   fillField(PDQDrugSummaryTest::PAGE_TITLE, 'pony');
    $this->getSession()->getPage()->
    -   fillField(PDQDrugSummaryTest::SHORT_TITLE, 'pony');

    // Submit the form and check for success.
    $this->getSession()->getPage()->pressButton(PDQDrugSummaryTest::SAVE_BUTTON);
    $this->drupalPostForm(NULL, )
    $this->assertResponse(200);
     */
  }

}
