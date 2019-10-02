<?php

namespace Drupal\Tests\app_module\Kernel;

use Drupal\Core\Database\IntegrityConstraintViolationException;
use Drupal\Core\Language\LanguageInterface;
use Drupal\KernelTests\KernelTestBase;

/**
 * Tests the AppPathStorage class.
 *
 * @group app_module
 */
class AppPathStorageTest extends KernelTestBase {

  /**
   * {@inheritdoc}
   */
  public static $modules = ['system', 'app_module'];

  /**
   * Gets the path storage.
   *
   * @var \Drupal\app_module\AppPathStorage
   */
  protected $storage;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();
    $this->storage = $this->container->get('app_module.app_path_storage');
  }

  /**
   * @covers ::load
   */
  public function testStorage() {

    // Store an item.
    $this->storage->save(
      123,
      '/node/10',
      '/test-alias-Case',
      'test_app_module'
    );

    $expected = [
      'pid' => 1,
      'owner_pid' => 123,
      'owner_alias' => '/test-alias-Case',
      'owner_source' => '/node/10',
      'app_module_id' => 'test_app_module',
      'app_module_data' => NULL,
      'langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED,
    ];

    $this->assertEquals($expected, $this->storage->load(['owner_alias' => '/test-alias-Case']));
    $this->assertEquals($expected, $this->storage->load(['owner_alias' => '/test-alias-case']));
    $this->assertEquals($expected, $this->storage->load(['owner_source' => '/node/10']));
    $this->assertEquals($expected, $this->storage->load(['owner_source' => '/Node/10']));
    $this->assertEquals($expected, $this->storage->load(['app_module_id' => 'test_app_module']));
    $this->assertEquals($expected, $this->storage->load(['owner_pid' => 123]));

    // Test Delete.
    $this->storage->delete(['owner_pid' => 123]);
    $this->assertFalse($this->storage->load(['owner_alias' => '/test-alias-Case']));

    // Store an item.
    $this->storage->save(
      123,
      '/node/11',
      '/test-multi-alias-1',
      'test_app_module'
    );

    // Store an item.
    $this->storage->save(
      345,
      '/node/12',
      '/test-multi-alias-2',
      'test_app_module'
    );

    // NOTE: PID is sorted desc.
    $expected_arr = [
      [
        'pid' => 3,
        'owner_pid' => 345,
        'owner_alias' => '/test-multi-alias-2',
        'owner_source' => '/node/12',
        'app_module_id' => 'test_app_module',
        'app_module_data' => NULL,
        'langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED,
      ],
      [
        'pid' => 2,
        'owner_pid' => 123,
        'owner_alias' => '/test-multi-alias-1',
        'owner_source' => '/node/11',
        'app_module_id' => 'test_app_module',
        'app_module_data' => NULL,
        'langcode' => LanguageInterface::LANGCODE_NOT_SPECIFIED,
      ],
    ];

    $actual_arr = $this->storage->loadAll();
    $this->assertEquals(count($expected_arr), count($actual_arr), "loadAll count the same.");
    $this->assertEquals($expected_arr[0], $actual_arr[0], "loadAll first app path good.");
    $this->assertEquals($expected_arr[1], $actual_arr[1], "loadAll second app path good.");

    $error_occurred = FALSE;

    try {
      $this->storage->save(
        345,
        '/node/12',
        '/test-multi-alias-2',
        'test_app_module'
      );
    }
    catch (IntegrityConstraintViolationException $e) {
      $error_occurred = TRUE;
    }

    $this->assertTrue(($error_occurred), "Should error saving a path with the same owner pid.");
  }

}
