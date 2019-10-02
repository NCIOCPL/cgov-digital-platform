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
   * @var \Drupal\Core\Path\AliasManagerInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $aliasManager;

  /**
   * Alias storage.
   *
   * @var \Drupal\Core\Path\AliasStorageInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $aliasStorage;

  /**
   * The app path manager.
   *
   * @var \Drupal\app_module\AppPathManager
   */
  protected $appPathManager;

  /**
   * Application path storage.
   *
   * @var \Drupal\app_module\AppPathStorageInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $appPathStorage;

  /**
   * Language manager.
   *
   * @var \Drupal\Core\Language\LanguageManagerInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $languageManager;

  /**
   * Cache backend.
   *
   * @var \Drupal\Core\Cache\CacheBackendInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $cache;

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
  protected function setUp() {
    parent::setUp();

    $this->appPathStorage = $this->getMock('Drupal\app_module\AppPathStorageInterface');
    $this->languageManager = $this->getMock('Drupal\Core\Language\LanguageManagerInterface');
    $this->cache = $this->getMock('Drupal\Core\Cache\CacheBackendInterface');
    $this->aliasManager = $this->getMock('Drupal\Core\Path\AliasManagerInterface');
    $this->aliasStorage = $this->getMock('Drupal\Core\Path\AliasStorageInterface');

    $this->appPathManager = new AppPathManager($this->aliasManager, $this->aliasStorage, $this->appPathStorage, $this->languageManager, $this->cache);

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
