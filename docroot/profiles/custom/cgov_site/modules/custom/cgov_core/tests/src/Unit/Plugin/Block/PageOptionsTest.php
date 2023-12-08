<?php

namespace Drupal\Tests\cgov_core\Unit\Plugin\Block;

use Drupal\cgov_core\Plugin\Block\PageOptions;
use Drupal\cgov_core\Services\PageOptionsManager;
use Drupal\Core\DependencyInjection\ContainerBuilder;
use Drupal\Tests\UnitTestCase;

/**
 * Tests Page Options Block Plugin.
 *
 * @group cgov_core
 */
class PageOptionsTest extends UnitTestCase {

  /**
   * The dependency injection container.
   *
   * @var \Symfony\Component\DependencyInjection\ContainerBuilder
   */
  protected $container;

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();
    $this->container = new ContainerBuilder();
    \Drupal::setContainer($this->container);
  }

  /**
   * Page Options block should make single call to service on setup.
   */
  public function testServiceCall() {
    $mockService = $this->getMockBuilder(PageOptionsManager::class)
      ->disableOriginalConstructor()
      ->getMock();
    $mockService->expects($this->once())
      ->method('getConfig')
      ->willReturn([]);
    new PageOptions([], 'page_options', ['provider' => 'dummy_provider'], $mockService);
  }

}
