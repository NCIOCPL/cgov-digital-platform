<?php

namespace Drupal\Tests\app_module\Unit;

use Drupal\Core\Language\Language;
use Drupal\Core\Language\LanguageInterface;

/**
 * @coversDefaultClass \Drupal\app_module\AppPathManager
 * @group app_module
 */
class AppPathManagerGetPathTest extends AppPathManagerTestBase {

  /**
   * Tests the getPathByRequest method - Negative Test.
   *
   * This is when there are no matches. There is another test that will
   * handle no matches when there ARE paths.
   *
   * @covers ::getPathByRequest
   */
  public function testGetPathByRequestNoMatch() {
    $path = '/' . $this->randomMachineName();

    $language = new Language(['id' => 'en']);

    // Initialize is called first.
    $this->appPathStorage->expects($this->once())
      ->method('loadAll')
      ->will($this->returnValue([]));

    // We fetch the language next.
    $this->languageManager->expects($this->any())
      ->method('getCurrentLanguage')
      ->with(LanguageInterface::TYPE_URL)
      ->will($this->returnValue($language));

    /* There is no call to anything else if there are no aliases from that
     * language.
     */

    $this->assertEquals(NULL, $this->appPathManager->getPathByRequest($path));
    // Call it twice to test the static cache.
    $this->assertEquals(NULL, $this->appPathManager->getPathByRequest($path));
  }

  /**
   * Tests the getPathByRequest method - Negative Test.
   *
   * This case handles when there is a matching alias without a path.
   *
   * @covers ::getPathByRequest
   */
  public function testGetPathByRequestAliasMatchNoPath() {
    $path = '/' . $this->randomMachineName();

    $language = new Language(['id' => 'en']);

    // Initialize is called first.
    $this->appPathStorage->expects($this->once())
      ->method('loadAll')
      ->will($this->returnValue(
        [
          [
            'pid' => 3,
            'owner_pid' => 123,
            'owner_source' => '/node/22',
            'owner_alias' => '/no-match',
            'app_module_id' => 'test_module_id',
            'app_module_data' => NULL,
            'langcode' => $language->getId(),
          ],
        ]
      ));

    // We fetch the language next.
    $this->languageManager->expects($this->any())
      ->method('getCurrentLanguage')
      ->with(LanguageInterface::TYPE_URL)
      ->will($this->returnValue($language));

    // Then there will be a call to alias manager.
    $this->aliasManager->expects($this->any())
      ->method('getPathByAlias')
      ->with($path, $language->getId())
      ->will($this->returnValue('/node/33'));

    $this->assertEquals(NULL, $this->appPathManager->getPathByRequest($path));
  }

  /**
   * Tests the getPathByRequest method - Negative Test.
   *
   * This case handles when there is NO matching alias and no path.
   *
   * @covers ::getPathByRequest
   */
  public function testGetPathByRequestNoAliasNoPath() {
    $path = '/' . $this->randomMachineName();

    $language = new Language(['id' => 'en']);

    // Initialize is called first.
    $this->appPathStorage->expects($this->once())
      ->method('loadAll')
      ->will($this->returnValue(
        [
          [
            'pid' => 3,
            'owner_pid' => 123,
            'owner_source' => '/node/22',
            'owner_alias' => '/no-match',
            'app_module_id' => 'test_module_id',
            'app_module_data' => NULL,
            'langcode' => $language->getId(),
          ],
        ]
      ));

    // We fetch the language next.
    $this->languageManager->expects($this->any())
      ->method('getCurrentLanguage')
      ->with(LanguageInterface::TYPE_URL)
      ->will($this->returnValue($language));

    // Then there will be a call to alias manager.
    $this->aliasManager->expects($this->any())
      ->method('getPathByAlias')
      ->with($path, $language->getId())
      ->will($this->returnValue($path));

    $this->assertEquals(NULL, $this->appPathManager->getPathByRequest($path));
  }

  /**
   * Tests the getPathByRequest method - Positive Test.
   *
   * This case handles an exact match for an alias with a path.
   *
   * @covers ::getPathByRequest
   */
  public function testGetPathByRequestExactMatch() {
    $path = '/' . $this->randomMachineName();
    $language = new Language(['id' => 'en']);

    $expected = [
      'pid' => 3,
      'owner_pid' => 123,
      'owner_source' => '/node/22',
      'owner_alias' => $path,
      'app_module_id' => 'test_module_id',
      'app_module_data' => NULL,
      'langcode' => $language->getId(),
    ];

    // Initialize is called first.
    $this->appPathStorage->expects($this->once())
      ->method('loadAll')
      ->will($this->returnValue(
        [
          [
            'pid' => 3,
            'owner_pid' => 123,
            'owner_source' => '/node/22',
            'owner_alias' => $path,
            'app_module_id' => 'test_module_id',
            'app_module_data' => NULL,
            'langcode' => $language->getId(),
          ],
        ]
      ));

    $this->appPathStorage->expects($this->exactly(2))
      ->method('load')
      ->with([
        'owner_alias' => $path,
        'langcode' => $language->getId(),
      ])
      ->will($this->returnValue($expected));

    // We fetch the language next.
    $this->languageManager->expects($this->any())
      ->method('getCurrentLanguage')
      ->with(LanguageInterface::TYPE_URL)
      ->will($this->returnValue($language));

    // Then there will be a call to alias manager.
    $this->aliasManager->expects($this->any())
      ->method('getPathByAlias')
      ->with($path, $language->getId())
      ->will($this->returnValue('/node/22'));

    $this->assertEquals($expected, $this->appPathManager->getPathByRequest($path));
    // Call it twice to test the static cache.
    $this->assertEquals($expected, $this->appPathManager->getPathByRequest($path));
  }

  /**
   * Tests the getPathByRequest method - Positive Test.
   *
   * This case handles a match for a path when it begins with an alias.
   *
   * @covers ::getPathByRequest
   */
  public function testGetPathByRequestMatch() {
    $path = '/' . $this->randomMachineName();
    $language = new Language(['id' => 'en']);

    $expected = [
      'pid' => 3,
      'owner_pid' => 123,
      'owner_source' => '/node/22',
      'owner_alias' => $path,
      'app_module_id' => 'test_module_id',
      'app_module_data' => NULL,
      'langcode' => $language->getId(),
    ];

    // Initialize is called first.
    $this->appPathStorage->expects($this->once())
      ->method('loadAll')
      ->will($this->returnValue(
        [
          [
            'pid' => 3,
            'owner_pid' => 123,
            'owner_source' => '/node/22',
            'owner_alias' => $path,
            'app_module_id' => 'test_module_id',
            'app_module_data' => NULL,
            'langcode' => $language->getId(),
          ],
        ]
      ));

    $this->appPathStorage->expects($this->exactly(2))
      ->method('load')
      ->with([
        'owner_alias' => $path,
        'langcode' => $language->getId(),
      ])
      ->will($this->returnValue($expected));

    // We fetch the language next.
    $this->languageManager->expects($this->any())
      ->method('getCurrentLanguage')
      ->with(LanguageInterface::TYPE_URL)
      ->will($this->returnValue($language));

    // Then there will be a call to alias manager.
    $this->aliasManager->expects($this->any())
      ->method('getPathByAlias')
      ->with($path . '/1234', $language->getId())
      ->will($this->returnValue($path . '/1234'));

    $this->assertEquals($expected, $this->appPathManager->getPathByRequest($path . '/1234'));
    // Call it twice to test the static cache.
    $this->assertEquals($expected, $this->appPathManager->getPathByRequest($path . '/1234'));
  }

  /**
   * Tests the getPathByRequest method - Positive Test.
   *
   * This case handles a match for a requested URL matches.
   *
   * @covers ::getPathByRequest
   */
  public function testGetPathByRequestMatchLongShort() {

    $language = new Language(['id' => 'en']);

    $expected1 = [
      'pid' => 3,
      'owner_pid' => 123,
      'owner_source' => '/node/22',
      'owner_alias' => '/short',
      'app_module_id' => 'test_module_id',
      'app_module_data' => NULL,
      'langcode' => $language->getId(),
    ];

    $expected2 = [
      'pid' => 5,
      'owner_pid' => 456,
      'owner_source' => '/node/33',
      'owner_alias' => '/short/then/long',
      'app_module_id' => 'test_module_id',
      'app_module_data' => NULL,
      'langcode' => $language->getId(),
    ];

    // Initialize is called first.
    $this->appPathStorage->expects($this->once())
      ->method('loadAll')
      ->will($this->returnValue(
        [
          $expected1,
          $expected2,
        ]
      ));

    $this->appPathStorage->expects($this->exactly(2))
      ->method('load')
      ->withConsecutive(
        [
          [
            'owner_alias' => '/short',
            'langcode' => $language->getId(),
          ],
        ],
        [
          [
            'owner_alias' => '/short/then/long',
            'langcode' => $language->getId(),
          ],
        ]
      )
      ->willReturnCallback(
        function ($conditions) use ($expected1, $expected2) {
          switch ($conditions['owner_alias']) {
            case '/short':
              return $expected1;

            case '/short/then/long':
              return $expected2;
          }
        }
      );

    // We fetch the language next.
    $this->languageManager->expects($this->any())
      ->method('getCurrentLanguage')
      ->with(LanguageInterface::TYPE_URL)
      ->will($this->returnValue($language));

    // Then there will be a call to alias manager.
    $this->aliasManager->expects($this->any())
      ->method('getPathByAlias')
      ->with($this->isType('string'), $language->getId())
      ->will($this->returnCallback(
        function ($path, $lang) {
          return $path;
        }
      ));

    // Make sure the substring match does not catch a partial word match.
    $this->assertEquals(NULL, $this->appPathManager->getPathByRequest('/shorter'));
    $this->assertEquals($expected1, $this->appPathManager->getPathByRequest('/short/1234'));
    $this->assertEquals($expected2, $this->appPathManager->getPathByRequest('/short/then/long/1234'));
  }

  /* TODO: Test Registration */

  /* TODO: Test Caching */

}
