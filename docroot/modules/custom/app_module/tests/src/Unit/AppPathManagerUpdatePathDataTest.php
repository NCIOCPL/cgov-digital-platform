<?php

namespace Drupal\Tests\app_module\Unit;

use Drupal\Core\Language\Language;

/**
 * @coversDefaultClass \Drupal\app_module\AppPathManager
 * @group app_module
 */
class AppPathManagerUpdatePathDataTest extends AppPathManagerTestBase {

  /**
   * Tests the registerAppPath method - Negative Test.
   *
   * Tests for when the entity is not good.
   *
   * @covers ::updateAppPathData
   */
  public function testRegisterPathNotGoodEntity() {
    // Not a Content Entity.
    $test_entity = $this->getNegativeContentEntity('\Drupal\Core\Entity\EntityInterface');
    $this->assertNull(
      $this->appPathManager->updateAppPath($test_entity),
      "Exits when not a content entity."
    );

    /* We want to create tests that should expose invalid checks. There are
     * a lot of conditions that will return NULL, so we need to ensure that
     * we are hitting the expected conditions. So you want tests that would
     * otherwise pass the rest of the conditions.
     * (In a perfect world with time and patience, we would count the number
     * of the various calls.)
     */

    /* NOTE: The generic interfaces may be bad (RevisionableContentEntity)
     * because they may not implement ALL the interfaces.
     */

    // Content Entity without path.
    $test_entity = $this->getNegativeContentEntity(
      '\Drupal\node\NodeInterface',
      FALSE,
      'field_application_module',
      TRUE,
      // Has field should be called once for path.
      1,
      TRUE,
      0
    );
    $this->assertNull(
      $this->appPathManager->updateAppPath($test_entity),
      "Exits when entity has no path field."
    );

    // Content Entity with path, no app module field.
    $test_entity = $this->getNegativeContentEntity(
      '\Drupal\node\NodeInterface',
      TRUE,
      'field_application_module',
      FALSE,
      // Has field should be called twice, once for path, once for appid.
      2,
      TRUE,
      0
    );
    $this->assertNull(
      $this->appPathManager->updateAppPath($test_entity),
      "Exits when content entity has path, but no app module field."
    );

    // Content Entity with path, with app module field, not default.
    /* @var \Drupal\node\NodeInterface */
    $test_entity = $this->getNegativeContentEntity(
      '\Drupal\node\NodeInterface',
      TRUE,
      'field_application_module',
      TRUE,
      // Has field should be called twice, once for path, once for appid.
      2,
      FALSE,
      1
    );
    $this->assertNull(
      $this->appPathManager->updateAppPath($test_entity),
      "Exits when revisionable, but not default revision."
    );

  }

  /*
   * Positive:
   *   Test non-revisionable entity.
   *   Test revisionable and default revision.
   */

  /**
   * Positive test for normal action.
   *
   * This is the most complicated. The was no app path found, so
   * we need to create it and not juust update.
   */
  public function testGoodEntityNoAlias() {

    $this->aliasStorage
      ->expects($this->exactly(1))
      ->method('load')
      ->with([
        'source' => '/node/22',
        'langcode' => 'en',
      ])
      ->willReturn(FALSE);

    // Setup Storage.
    // Expected Load looking for an existing app path.
    $this->appPathStorage
      ->expects($this->never())
      ->method('load');

    // Expected save call at the end.
    $this->appPathStorage
      ->expects($this->never())
      ->method('save');

    $entity = $this->getMockedNode(
      123,
      'node/22',
      NULL,
      new Language(['id' => 'en']),
      'test_app_module',
      NULL
    );

    $actual = $this->appPathManager->updateAppPath($entity);
    $this->assertNull($actual, "No app path created because no alias exists");
  }

  /**
   * Positive test for normal action.
   *
   * This is the most complicated. The was no app path found, so
   * we need to create it and not juust update.
   */
  public function testGoodEntityNew() {

    $expected = [
      'pid' => 3,
      'owner_pid' => 123,
      'owner_source' => '/node/22',
      'owner_alias' => '/test-alias',
      'app_module_id' => 'test_app_module',
      'app_module_data' => NULL,
      'langcode' => 'en',
    ];

    // Alias storage to lookup alias.
    $this->aliasStorage
      ->expects($this->exactly(1))
      ->method('load')
      ->with([
        'source' => '/node/22',
        'langcode' => 'en',
      ])
      ->willReturn([
        'pid' => 123,
        'source' => '/node/22',
        'alias' => '/test-alias',
        'langcode' => 'en',
      ]);

    // Setup Storage.
    // Expected Load looking for an existing app path.
    $this->appPathStorage
      ->expects($this->exactly(1))
      ->method('load')
      ->with(['owner_pid' => 123])
      ->willReturn(FALSE);

    // Expected save call at the end.
    $this->appPathStorage
      ->expects($this->exactly(1))
      ->method('save')
      ->with(
        123,
        '/node/22',
        '/test-alias',
        'test_app_module',
        NULL,
        'en',
        NULL
      )
      ->will($this->returnCallback(
        function (
          $owner_pid,
          $owner_source,
          $owner_alias,
          $app_module_id,
          $app_module_data,
          $langcode,
          $pid
        ) {
          return [
            'pid' => $pid ?? 3,
            'owner_pid' => $owner_pid,
            'owner_source' => $owner_source,
            'owner_alias' => $owner_alias,
            'app_module_id' => $app_module_id,
            'app_module_data' => $app_module_data,
            'langcode' => $langcode,
          ];
        }
      ));

    $entity = $this->getMockedNode(
      123,
      'node/22',
      '/test-alias',
      new Language(['id' => 'en']),
      'test_app_module',
      NULL
    );

    $actual = $this->appPathManager->updateAppPath($entity);
    $this->assertEquals($expected, $actual, "Insert new alias.");
  }

  /**
   * Positive test for normal action.
   */
  public function testGoodEntityUpdate() {

    $expected = [
      'pid' => 3,
      'owner_pid' => 123,
      'owner_source' => '/node/22',
      'owner_alias' => '/test-alias',
      'app_module_id' => 'test_app_module',
      'app_module_data' => NULL,
      'langcode' => 'en',
    ];

    // Alias storage to lookup alias.
    $this->aliasStorage
      ->expects($this->exactly(1))
      ->method('load')
      ->with([
        'source' => '/node/22',
        'langcode' => 'en',
      ])
      ->willReturn([
        'pid' => 123,
        'source' => '/node/22',
        'alias' => '/test-alias',
        'langcode' => 'en',
      ]);

    // Setup Storage.
    // Expected Load looking for an existing app path.
    $this->appPathStorage
      ->expects($this->exactly(1))
      ->method('load')
      ->with(['owner_pid' => 123])
      ->willReturn([
        'pid' => 3,
        'owner_pid' => 123,
        'owner_source' => '/node/22',
        'owner_alias' => '/test-alias',
        'app_module_id' => 'other_app_module',
        'app_module_data' => NULL,
        'langcode' => 'en',
      ]);

    // Expected save call at the end.
    $this->appPathStorage
      ->expects($this->exactly(1))
      ->method('save')
      ->with(
        123,
        '/node/22',
        '/test-alias',
        'test_app_module',
        NULL,
        'en',
        3
      )
      ->will($this->returnCallback(
        function (
          $owner_pid,
          $owner_source,
          $owner_alias,
          $app_module_id,
          $app_module_data,
          $langcode,
          $pid
        ) {
          return [
            'pid' => $pid ?? 99,
            'owner_pid' => $owner_pid,
            'owner_source' => $owner_source,
            'owner_alias' => $owner_alias,
            'app_module_id' => $app_module_id,
            'app_module_data' => $app_module_data,
            'langcode' => $langcode,
          ];
        }
      ));

    $entity = $this->getMockedNode(
      123,
      'node/22',
      '/test-alias',
      new Language(['id' => 'en']),
      'test_app_module',
      NULL
    );

    $actual = $this->appPathManager->updateAppPath($entity);
    $this->assertEquals($expected, $actual, "Update alias.");
  }

  /**
   * Helper method to get content entity for negative tests.
   *
   * @return \Drupal\node\NodeInterface
   *   A mocked node.
   */
  protected function getMockedNode(
    $owner_pid,
    $route,
    $alias,
    $language,
    $app_module_id,
    $app_module_data
  ) {
    $urlMock = $this->getMockBuilder('Drupal\Core\Url')
      ->disableOriginalConstructor()
      ->getMock();

    $urlMock->expects($this->any())
      ->method('getInternalPath')
      ->willReturn($route);

    /* @var \Drupal\node\NodeInterface */
    $entity = $this->getMockBuilder('\Drupal\node\Entity\Node')
      ->disableOriginalConstructor()
      ->getMock();

    $entity->expects($this->any())
      ->method('toUrl')
      ->willReturn($urlMock);

    $entity->expects($this->any())
      ->method('hasField')
      ->with($this->isType('string'))
      ->willReturn(TRUE);

    $entity->expects($this->any())
      ->method('isDefaultRevision')
      ->willReturn(TRUE);

    $entity->expects($this->any())
      ->method('language')
      ->willReturn($language);

    $app_module_field_list = $this->getFieldItemList(
      [
        $this->getMockAppModuleField($app_module_id, $app_module_data),
      ]
    );

    $entity->expects($this->any())
      ->method('__get')
      ->will($this->returnCallback(
        function ($field_name) use ($app_module_field_list) {
          switch ($field_name) {

            case 'field_application_module':
              return $app_module_field_list;

            default:
              throw new Exception("Unknown field " . $field_name);
          }
        }
      ));

    return $entity;
  }

  /**
   * Helper function to get app module field.
   *
   * @return \Drupal\Core\Field\FieldItemInterface
   *   The field item mock.
   */
  protected function getMockAppModuleField($app_module_id, $app_module_data) {
    $field = $this->getMockBuilder('\Drupal\Core\Field\FieldItemInterface')
      ->disableOriginalConstructor()
      ->getMock();

    $field->expects($this->any())
      ->method('__get')
      ->with($this->isType('string'))
      ->will($this->returnCallback(
        function ($field_name) use ($app_module_id, $app_module_data) {
          switch ($field_name) {
            case 'target_id':
              return $app_module_id;

            case 'data':
              return $app_module_data;

            default:
              throw new Exception("Unknown field " . $field_name);
          }
        }
      ));

    return $field;
  }

  /**
   * Helper function to deal with a list of FieldItemInterface items.
   *
   * @return \Drupal\Core\Field\FieldItemListInterface
   *   The field mock.
   */
  protected function getFieldItemList(array $field_items) {
    $field_list = $this->getMockBuilder('\Drupal\Core\Field\FieldItemListInterface')
      ->disableOriginalConstructor()
      ->getMock();

    // Look at FieldItemList, but $entity->field->value looks for the
    // 'value' property of the first field item.
    $field_list->expects($this->any())
      ->method('__get')
      ->will($this->returnCallback(
        function ($prop_name) use ($field_items) {
          if (count($field_items)) {
            return $field_items[0]->__get($prop_name);
          }
          else {
            return NULL;
          }
        }
      ));

    return $field_list;
  }

  /**
   * Helper method to get content entity for negative tests.
   */
  protected function getNegativeContentEntity(
    $type,
    $has_path = FALSE,
    $app_module_field = 'field_application_module',
    $has_app_id = FALSE,
    $expected_field_calls = 0,
    $is_default_revision = FALSE,
    $expected_revision_calls = 0
  ) {
    // Mock the type to be used later.
    $entity = $this->getMockBuilder($type)
      ->disableOriginalConstructor()
      ->getMock();

    if ($type === '\Drupal\node\NodeInterface') {
      $entity->expects($this->exactly($expected_revision_calls))
        ->method('isDefaultRevision')
        ->willReturn($is_default_revision);
    }

    if (
      $type === '\Drupal\node\NodeInterface'
    ) {
      $entity->expects($this->exactly($expected_field_calls))
        ->method('hasField')
        ->with($this->isType('string'))
        ->will($this->returnCallback(
          function ($field_name) use ($has_path, $app_module_field, $has_app_id) {
            switch ($field_name) {
              case 'path':
                return $has_path;

              case $app_module_field:
                return $has_app_id;

              default:
                throw new Exception("Unexpected field " . $field_name);
            }
          }
        )
      );
    }

    return $entity;
  }

}
