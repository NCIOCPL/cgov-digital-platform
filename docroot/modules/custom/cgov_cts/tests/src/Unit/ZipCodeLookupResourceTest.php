<?php

namespace Drupal\Tests\cgov_cts\Unit;

use Drupal\Core\DependencyInjection\ContainerBuilder;
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
   * Mock CacheContextsManager.
   *
   * @var \Drupal\Core\Cache\Context\CacheContextsManager|PHPUnit_Framework_MockObject_MockObject
   */
  protected $mockCacheContextsManager;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    // The cache context merging in the rest service requires the caching
    // service, which requires the Drupal DI container to be available.
    $this->mockCacheContextsManager = $this->createMock('Drupal\Core\Cache\Context\CacheContextsManager');
    $container = new ContainerBuilder();
    \Drupal::setContainer($container);
    $container->set('cache_contexts_manager', $this->mockCacheContextsManager);

    // Mock the logger.
    $this->logger = $this->createMock('\Psr\Log\LoggerInterface');
  }

  /**
   * Tests Zip Code Get.
   */
  public function testGetWithMatch() {

    $zip_lookup_svc = $this->createMock('\Drupal\cgov_cts\ZipCodeLookupServiceInterface');
    $zip_lookup_svc->expects($this->exactly(1))
      ->method('getGeocoordinates')
      ->with('20852')
      ->willReturn([
        "lat" => 1,
        "long" => 1,
      ]);

    // So this is really just fudging, and there needs to be some integration
    // tests for these items. Mocking up the entire cache structure is really
    // problemmatic. So we are going to just have to always hope that url.path
    // is one of the valid Drupal tokens.
    $this->mockCacheContextsManager->expects($this->any())
      ->method('assertValidTokens')
      ->willReturn(['url.path']);

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

    $this->assertEquals(
      ['url.path'],
      $actual->getCacheableMetadata()->getCacheContexts(),
      "Found url.path cache context correct"
    );

  }

  /**
   * Tests Zip Code Get.
   */
  public function testGetWithoutMatch() {

    $zip_lookup_svc = $this->createMock('\Drupal\cgov_cts\ZipCodeLookupServiceInterface');
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

    $zip_lookup_svc = $this->createMock('\Drupal\cgov_cts\ZipCodeLookupServiceInterface');
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
