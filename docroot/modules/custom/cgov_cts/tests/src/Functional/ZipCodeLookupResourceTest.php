<?php

namespace Drupal\Tests\cgov_cts\Functional;

use Drupal\Tests\BrowserTestBase;

/**
 * Test the Config Entity Example module.
 *
 * @group config_entity_example
 * @group examples
 *
 * @ingroup config_entity_example
 */
class ZipCodeLookupResourceTest extends BrowserTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = ['app_module', 'cgov_cts'];

  /**
   * The installation profile to use with this test.
   *
   * @var string
   */
  protected $profile = 'minimal';

  /**
   * Tests the zip code lookup.
   *
   * This is pretty much testing that all the configs are in place, the unit
   * tests are what ensure the functionality is working 100%. This also makes
   * sure the module dependencies are correct.
   */
  public function testZipLookup() {
    $assert = $this->assertSession();
    $this->drupalGet('/cts_api/zip_code_lookup/20850');
    $assert->statusCodeEquals(200);
  }

}
