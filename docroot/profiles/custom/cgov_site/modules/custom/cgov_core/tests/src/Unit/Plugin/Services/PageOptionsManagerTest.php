<?php

namespace Drupal\Tests\cgov_core\Unit\Plugin\Services;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_core\Services\PageOptionsManager;
use Drupal\Core\Routing\RouteMatchInterface;
use Drupal\Core\Entity\ContentEntityInterface;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

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
    $mockContentEntityInterface = $this->getMock(ContentEntityInterface::class);
    $mockContentEntityInterface->expects($this->any())
      ->method('bundle')
      ->willReturn($given);
    $mockRouteInterface = $this->getMock(RouteMatchInterface::class);
    $mockParameterBag = $this->getMock(ParameterBagInterface::class);
    $mockParameterBag->expects($this->any())
      ->method('all')
      ->willReturn([$given => $mockContentEntityInterface]);
    $mockRouteInterface->expects($this->any())
      ->method('getParameters')
      ->willReturn($mockParameterBag);
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
