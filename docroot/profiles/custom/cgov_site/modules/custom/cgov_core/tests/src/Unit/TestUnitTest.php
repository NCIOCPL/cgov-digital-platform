<?php

namespace CGov\Tests\Core\Unit;

use Drupal\Tests\UnitTestCase;

/**
 * Tests Unit Test Configuration.
 *
 * @group cgov_core
 */
class TestUnitTest extends UnitTestCase {

  /**
   * Tests truthy.
   */
  public function testTruthy() {
    $this->assertTrue(TRUE, 'Unit Tests are Configured Correctly.');
  }

}
