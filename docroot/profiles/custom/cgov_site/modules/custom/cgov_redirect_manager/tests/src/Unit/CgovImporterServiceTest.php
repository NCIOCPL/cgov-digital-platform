<?php

namespace Drupal\Tests\cgov_redirect_manager\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_redirect_manager\CgovImporterService;
use org\bovigo\vfs\vfsStream;

/**
 * Tests Unit Test Configuration.
 *
 * @group cgov_core
 */
class TestUnitTest extends UnitTestCase {

  /**
   * Tests truthy.
   */
  public function testReadExpandLine() {
    $csv = <<<CSV
/espanol/foo/bar,/espanol/bar/bazz
/foo/bar,/bar/bazz
/bazz/bob,/blee/bargh,301,en
 /blee,  /blab
CSV;

    // Mock the file system with our content.
    vfsStream::setup('tmp', NULL, [
      'test.csv' => $csv,
    ]);

    // Open the fake file for reading.
    $f = fopen('vfs://tmp/test.csv', 'r');

    $actual = [];
    while ($line = CgovImporterService::readExpandLine($f, ',', '301', 'en')) {
      $actual[] = $line;
    }

    $expected = [
      ['/foo/bar', '/espanol/bar/bazz', '301', 'es'],
      ['/foo/bar', '/bar/bazz', '301', 'en'],
      ['/bazz/bob', '/blee/bargh', '301', 'en'],
      ['/blee', '/blab', '301', 'en'],
    ];

    $this->assertEquals($actual, $expected);
  }

}
