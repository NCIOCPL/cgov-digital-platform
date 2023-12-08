<?php

namespace Drupal\Tests\cgov_redirect_manager\Functional;

use CgovPlatform\Tests\CgovSchemaExclusions;
use Drupal\Tests\BrowserTestBase;
use Drush\TestTraits\DrushTestTrait;

/**
 * Kernel tests for CgovImporterService.
 */
class CgovImporterServiceTest extends BrowserTestBase {

  use DrushTestTrait;

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
  protected $defaultTheme = 'ncids_trans';

  /**
   * The user used by the test.
   *
   * @var \Drupal\user\Entity\User
   */
  protected $account;

  /**
   * {@inheritdoc}
   */
  public function setUp() : void {
    static::$configSchemaCheckerExclusions = CgovSchemaExclusions::$configSchemaCheckerExclusions;
    parent::setUp();

    $this->account = $this->drupalCreateUser(['administer redirects']);
    $this->drupalLogin($this->account);

  }

  /**
   * Tests the redirect manager.
   */
  public function testRedirectManager() {
    $this->checkNormalOperation();
  }

  /**
   * Test to see if normal operations work.
   */
  private function checkNormalOperation() {
    // Create our CSV.
    $csv = <<<CSV
/espanol/foo/bar,/espanol/bar/bazz2
/foo/bar,/bar/bazz
/bazz/bob,/blee/bargh,301,en
 /blee,  /blab
/chicken,https://www.google.com,301,es
CSV;

    // Get random name for csv file and create it.
    $file_name = $this->randomMachineName() . '.csv';
    $file_system = $this->container->get('file_system');
    $real_file_path = $file_system->saveData($csv, 'temporary://' . $file_name);

    $this->drupalGet('admin/config/search/cgov-redirect-manager');

    // Upload with replace to guarantee there's something there.
    $edit = [
      'files[file]' => $real_file_path,
    ];

    $this->submitForm($edit, 'Upload Redirects');

    $this->assertSession()->statusCodeEquals(200);

    $queue_svc = $this->container->get('queue');
    $queue = $queue_svc->get('cgov_redirect_manager_queue_worker');
    $this->assertEquals(1, $queue->numberOfItems(), 'Check correct number of queue items after upload.');

    // We are going to just run the Drush command to process the queue.
    // Currently this does not run from cron, instead you need to run
    // the queue processor.
    $this->drush(
      'queue:run',
      ['cgov_redirect_manager_queue_worker'],
    );

    $queue = $queue_svc->get('cgov_redirect_manager_queue_worker');
    $this->assertEquals(0, $queue->numberOfItems(), 'Check correct number of queue items after processing queue.');

    /*
    $connection = $this->container->get('database');
    $results = $connection->query('SELECT * FROM {redirect}')->fetchAll();
     */

    /* verify redirects exist. */
    $redirect_repository = $this->container->get('redirect.repository');

    // CSV - /espanol/foo/bar,/espanol/bar/bazz2.
    $redirect1 = $redirect_repository->findMatchingRedirect('foo/bar', [], 'es');
    $this->assertNotNull($redirect1, 'Redirect 1 - Spanish /foo/bar exists');
    $this->assertEquals('/espanol/bar/bazz2', $redirect1->getRedirectUrl()->toString());

    // CSV - /foo/bar,/bar/bazz.
    $redirect2 = $redirect_repository->findMatchingRedirect('/foo/bar', [], 'en');
    $this->assertNotNull($redirect2, 'Redirect 2 - English /foo/bar exists');
    $this->assertEquals('/bar/bazz', $redirect2->getRedirectUrl()->toString());

    // CSV - /bazz/bob,/blee/bargh,301,en.
    $redirect3 = $redirect_repository->findMatchingRedirect('/bazz/bob', [], 'en');
    $this->assertNotNull($redirect3, 'Redirect 3 - English /bazz/bob exists');
    $this->assertEquals('/blee/bargh', $redirect3->getRedirectUrl()->toString());

    // CSV -  /blee,  /blab.
    $redirect4 = $redirect_repository->findMatchingRedirect('/blee', [], 'en');
    $this->assertNotNull($redirect4, 'Redirect 4 - English /blee exists');
    $this->assertEquals('/blab', $redirect4->getRedirectUrl()->toString());

    // CSV - /chicken,https://www.google.com,301,es
    $redirect5 = $redirect_repository->findMatchingRedirect('/chicken', [], 'es');
    $this->assertNotNull($redirect5, 'Redirect 5 - Spanish /chicken exists');
    $this->assertEquals('https://www.google.com', $redirect5->getRedirectUrl()->toString());

  }

}
