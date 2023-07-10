<?php

namespace Drupal\Tests\app_module\Unit;

use Drupal\app_module\AppPathManager;
use Drupal\Core\Language\Language;
use Drupal\Core\Language\LanguageInterface;
use Drupal\Tests\UnitTestCase;

/**
 * Base class for AppPathManager tests.
 */
abstract class AppPathManagerTestBase extends UnitTestCase {

  /**
   * Alias manager.
   *
   * @var \Drupal\path_alias\AliasManagerInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $aliasManager;

  /**
   * Alias storage.
   *
   * @var \Drupal\Core\Entity\EntityStorageInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $aliasStorage;

  /**
   * Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $entityTypeManager;

  /**
   * The app path manager.
   *
   * @var \Drupal\app_module\AppPathManager
   */
  protected $appPathManager;

  /**
   * Application path storage.
   *
   * @var \Drupal\app_module\AppPathStorageInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $appPathStorage;

  /**
   * Language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $languageManager;

  /**
   * Cache backend.
   *
   * @var \Drupal\Core\Cache\CacheBackendInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $cache;

  /**
   * Entity Query Mock.
   *
   * @var \Drupal\Core\Entity\Query\QueryInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $entityQuery;

  /**
   * Time Service Mock.
   *
   * @var \Drupal\Component\Datetime\TimeInterface|\PHPUnit\Framework\MockObject\MockObject
   */
  protected $timeSvc;

  /**
   * The internal cache key used by the alias manager.
   *
   * @var string
   */
  protected $cacheKey = 'app-module-paths:key';

  /**
   * The cache key passed to the alias manager.
   *
   * @var string
   */
  protected $path = 'key';

  /**
   * {@inheritdoc}
   */
  protected function setUp(): void {
    parent::setUp();

    $this->appPathStorage = $this->createMock('Drupal\app_module\AppPathStorageInterface');
    $this->languageManager = $this->createMock('Drupal\Core\Language\LanguageManagerInterface');
    $this->cache = $this->createMock('Drupal\Core\Cache\CacheBackendInterface');
    $this->aliasManager = $this->createMock('Drupal\path_alias\AliasManagerInterface');
    $this->entityTypeManager = $this->createMock('Drupal\Core\Entity\EntityTypeManagerInterface');
    $this->aliasStorage = $this->createMock('Drupal\Core\Entity\EntityStorageInterface');
    $this->entityQuery = $this->createMock('Drupal\Core\Entity\Query\QueryInterface');
    $this->timeSvc = $this->createMock('Drupal\Component\Datetime\TimeInterface');

    $this->entityQuery
      ->expects($this->any())
      ->method('accessCheck')
      ->with(FALSE)
      ->willReturn($this->entityQuery);

    $this->entityQuery
      ->expects($this->any())
      ->method('sort')
      ->with('id', 'DESC')
      ->willReturn($this->entityQuery);

    $this->entityQuery
      ->expects($this->any())
      ->method('range')
      ->with(0, 1)
      ->willReturn($this->entityQuery);

    $this->entityTypeManager
      ->expects($this->any())
      ->method('getStorage')
      ->with('path_alias')
      ->willReturn($this->aliasStorage);

    $this->aliasStorage
      ->expects($this->any())
      ->method('getQuery')
      ->willReturn($this->entityQuery);

    $this->appPathManager = new AppPathManager(
      $this->aliasManager,
      $this->entityTypeManager,
      $this->appPathStorage,
      $this->languageManager,
      $this->cache,
      $this->timeSvc
    );

  }

  /**
   * Sets up the current language.
   *
   * @return \Drupal\Core\Language\LanguageInterface
   *   The current language object.
   */
  protected function setUpCurrentLanguage() {
    $language = new Language(['id' => 'en']);

    $this->languageManager->expects($this->any())
      ->method('getCurrentLanguage')
      ->with(LanguageInterface::TYPE_URL)
      ->will($this->returnValue($language));

    return $language;
  }

}
