<?php

namespace Drupal\Tests\pdq_core\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_infographic\Controller\CGovInfographicController;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Test longDescription method for Infographic controller.
 */
class ControllerLongDescription extends UnitTestCase {

  /**
   * Tests that longDescription correctly handles a null input.
   *
   * NOTE: PHPUnitdoesn't provide a good way to test that an exception
   * occured in a specific place, only that it occured at all, which means
   * you can't write a single test method for multiple invalid input values.
   */
  public function testInvalidInputNull() {

    $this->expectException(NotFoundHttpException::class);

    $controller = new CGovInfographicController();
    $controller->longDescription(NULL);
  }

  /**
   * Tests that longDescription correctly handles an empty string input.
   *
   * NOTE: PHPUnitdoesn't provide a good way to test that an exception
   * occured in a specific place, only that it occured at all, which means
   * you can't write a single test method for multiple invalid input values.
   */
  public function testInvalidInputEmptyString() {

    $this->expectException(NotFoundHttpException::class);

    $controller = new CGovInfographicController();
    $controller->longDescription('');
  }

  /**
   * Tests that longDescription correctly handles a string input.
   *
   * NOTE: PHPUnitdoesn't provide a good way to test that an exception
   * occured in a specific place, only that it occured at all, which means
   * you can't write a single test method for multiple invalid input values.
   */
  public function testInvalidInputString() {

    $this->expectException(NotFoundHttpException::class);

    $controller = new CGovInfographicController();
    $controller->longDescription('pony');
  }

  /**
   * Tests that longDescription correctly handles boolean TRUE input.
   *
   * NOTE: PHPUnitdoesn't provide a good way to test that an exception
   * occured in a specific place, only that it occured at all, which means
   * you can't write a single test method for multiple invalid input values.
   */
  public function testInvalidInputTrue() {

    $this->expectException(NotFoundHttpException::class);

    $controller = new CGovInfographicController();
    $controller->longDescription(TRUE);
  }

  /**
   * Tests that longDescription correctly handles boolean FALSE input.
   *
   * NOTE: PHPUnitdoesn't provide a good way to test that an exception
   * occured in a specific place, only that it occured at all, which means
   * you can't write a single test method for multiple invalid input values.
   */
  public function testInvalidInputFalse() {

    $this->expectException(NotFoundHttpException::class);

    $controller = new CGovInfographicController();
    $controller->longDescription(FALSE);
  }

}
