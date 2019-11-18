<?php

namespace Drupal\Tests\cgov_cts\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_cts\Plugin\rest\resource\ZipCodeLookupResource;
use Symfony\Component\HttpKernel\Exception\BadRequestHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

/**
 * Tests for the Zip Code Lookup Rest Endpoint.
 */
class ZipCodeLookupResourceTest extends UnitTestCase {

  /**
   * The logger.
   *
   * @var \Psr\Log\LoggerInterface|PHPUnit_Framework_MockObject_MockObject
   */
  protected $logger;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->logger = $this->getMock('\Psr\Log\LoggerInterface');
  }

  /**
   * Tests Zip Code Get.
   */
  public function testGetWithMatch() {

    $zip_lookup_svc = $this->getMock('\Drupal\cgov_cts\ZipCodeLookupServiceInterface');
    $zip_lookup_svc->expects($this->exactly(1))
      ->method('getGeocoordinates')
      ->with('20852')
      ->willReturn([
        "lat" => 1,
        "long" => 1,
      ]);

    $resource = $this->getResourceInstance($zip_lookup_svc);

    $actual = $resource->get('20852');
    $this->assertEquals(
      ["lat" => 1, "long" => 1],
      $actual->getResponseData(),
      "Found zipcode 20852 correct response."
    );

    $this->assertEquals(
      ['zip_code_lookup_resource', 'zip_code_lookup_resource:20852'],
      $actual->getCacheableMetadata()->getCacheTags(),
      "Found zipcode 20852 cache tags correct"
    );
  }

  /**
   * Tests Zip Code Get.
   */
  public function testGetWithoutMatch() {

    $zip_lookup_svc = $this->getMock('\Drupal\cgov_cts\ZipCodeLookupServiceInterface');
    $zip_lookup_svc->expects($this->exactly(1))
      ->method('getGeocoordinates')
      ->with('11111')
      ->willReturn(NULL);

    $resource = $this->getResourceInstance($zip_lookup_svc);

    $threw_ex = FALSE;
    try {
      $resource->get('11111');
    }
    catch (NotFoundHttpException $exception) {
      $threw_ex = TRUE;
    }

    $this->assertTrue($threw_ex, "Missing zip threw not found.");
  }

  /**
   * Tests Zip Code Get.
   */
  public function testGetBadZips() {

    $zip_lookup_svc = $this->getMock('\Drupal\cgov_cts\ZipCodeLookupServiceInterface');
    $zip_lookup_svc->expects($this->never())
      ->method('getGeocoordinates');

    $resource = $this->getResourceInstance($zip_lookup_svc);

    $threw_ex_invalid = FALSE;
    try {
      $resource->get('chicken');
    }
    catch (BadRequestHttpException $exception) {
      $threw_ex_invalid = TRUE;
    }
    $this->assertTrue($threw_ex_invalid, "Invalid zip threw exception.");

    $threw_ex_null = FALSE;
    try {
      $resource->get(NULL);
    }
    catch (BadRequestHttpException $exception) {
      $threw_ex_null = TRUE;
    }
    $this->assertTrue($threw_ex_null, "Null zip threw exception.");

  }

  /**
   * Helper function to get a rest resource class instance.
   */
  private function getResourceInstance($lookup_svc) {
    return new ZipCodeLookupResource(
      [],
      'zip_code_lookup_resource',
      [],
      ['json'],
      $this->logger,
      $lookup_svc
    );
  }

}
