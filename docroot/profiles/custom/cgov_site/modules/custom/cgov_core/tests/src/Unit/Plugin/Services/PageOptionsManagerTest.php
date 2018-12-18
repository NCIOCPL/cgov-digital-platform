<?php

namespace Drupal\Tests\cgov_core\Unit\Plugin\Services;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_core\Services\PageOptionsManager;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\node\NodeInterface;

/**
 * Tests Page Options Manager Service.
 *
 * @group cgov_core
 */
class PageOptionsManagerTest extends UnitTestCase {

  /**
   * Test service correct handles various node types.
   *
   * @dataProvider dataForTests
   */
  public function testGetConfig($given, $expected) {
    $mockNodeInterface = $this->getMock(NodeInterface::class);
    $mockNodeInterface->expects($this->any())
      ->method('getType')
      ->willReturn($given);
    $mockRouteInterface = $this->getMock(RouteMatchInterface::class);
    $mockRouteInterface->expects($this->any())
      ->method('getParameter')
      ->with('node')
      ->willReturn($mockNodeInterface);
    $pageOptionsManager = new PageOptionsManager($mockRouteInterface);
    $pageOptionsConfig = $pageOptionsManager->getConfig();
    $this->assertArrayEquals($pageOptionsConfig, $expected);

  }

  /**
   * Test data for assertions.
   *
   * @return array
   *   Test data.
   */
  public function dataForTests() {
    return [
      'no node' => [
        '',
        [],
      ],
      'article node' => [
        'cgov_article',
        [
          'resize' => TRUE,
          'print' => TRUE,
          'email' => TRUE,
          'facebook' => TRUE,
          'twitter' => TRUE,
          'pinterest' => TRUE,
        ],
      ],
    ];
  }

}
