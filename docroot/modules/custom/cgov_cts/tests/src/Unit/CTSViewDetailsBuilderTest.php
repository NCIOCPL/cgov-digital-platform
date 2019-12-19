<?php

namespace Drupal\Tests\cgov_cts\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_cts\MultiRouteBuilders\CTSViewDetailsBuilder;
use Symfony\Component\HttpFoundation\RequestStack;

/**
 * Tests for the CTSManager.
 */
class CTSViewDetailsBuilderTest extends UnitTestCase {

  /**
   * Symfony\Component\HttpFoundation\RequestStack definition.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * The CTSManager client.
   *
   * @var \Drupal\cgov_cts\Services\CTSManager
   */
  private $manager;

  /**
   * The logger mock.
   *
   * @var \Psr\Log\LoggerInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $logger;

  /**
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    $this->requestStack = new RequestStack();
    $this->manager = $this->getMockBuilder('\Drupal\cgov_cts\Services\CTSManager')
      ->disableOriginalConstructor()
      ->getMock();
    $this->logger = $this->getMock('\Psr\Log\LoggerInterface');
  }

  /**
   * {@inheritdoc}
   */
  public function testBuilder() {
    $builder = new CTSViewDetailsBuilder($this->requestStack, $this->manager, $this->logger);
    $this->assertNotNull($builder, 'Can create new instance of builder class');
  }

  /**
   * {@inheritdoc}
   */
  public function testAppModuleId() {
    $builder = new CTSViewDetailsBuilder($this->requestStack, $this->manager, $this->logger);
    $this->assertEquals($builder->id(), 'view_details', 'ID is "view_details".');
  }

}
