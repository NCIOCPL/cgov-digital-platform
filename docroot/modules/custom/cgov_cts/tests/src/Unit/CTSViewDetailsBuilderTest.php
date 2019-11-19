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
   * {@inheritdoc}
   */
  public function setUp() {
    parent::setUp();

    $this->requestStack = new RequestStack();
    $this->manager = $this->getMockBuilder('\Drupal\cgov_cts\Services\CTSManager')
      ->disableOriginalConstructor()
      ->getMock();
  }

  /**
   * {@inheritdoc}
   */
  public function testBuilder() {
    $builder = new CTSViewDetailsBuilder($this->requestStack, $this->manager);
    $this->assertNotNull($builder, 'Can create new instance of builder class');
  }

  /**
   * {@inheritdoc}
   */
  public function testAppModuleId() {
    $builder = new CTSViewDetailsBuilder($this->requestStack, $this->manager);
    $this->assertEquals($builder->id(), 'view_details', 'ID is "view_details".');
  }

}
