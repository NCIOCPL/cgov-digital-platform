<?php

namespace Drupal\Tests\cgov_cts\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_cts\FileBasedZipCodeLookupService;

/**
 * Tests for the FileBasedZipCodeLookupService.
 */
class FileBasedZipCodeLookupServiceTest extends UnitTestCase {

  /**
   * Tests lookup.
   */
  public function testZipCodeLookup() {
    $svc = FileBasedZipCodeLookupService::create();
    $actual = $svc->getGeocoordinates('20850');
    $this->assertEquals(
      ['lat' => 39.087, 'long' => -77.168],
      $actual,
      "Zip code looked up successfully."
    );
  }

  /**
   * Tests lookup.
   */
  public function testZipCodeLookupNotFound() {
    $svc = FileBasedZipCodeLookupService::create();
    $actual = $svc->getGeocoordinates('00000');
    $this->assertEquals(
      NULL,
      $actual,
      "Zip code not found."
    );
  }

}
