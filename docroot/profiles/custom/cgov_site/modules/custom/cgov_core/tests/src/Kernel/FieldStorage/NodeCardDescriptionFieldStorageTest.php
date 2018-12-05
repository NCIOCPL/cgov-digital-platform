<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

/**
 * Tests node Card Description field storage.
 *
 * @group cgov_core
 */
class NodeCardDescriptionFieldStorageTest extends CGovFieldStorageTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'user', 'system', 'field', 'node', 'text', 'filter', 'workflows', 'content_moderation', 'cgov_core',
  ];

  /**
   * Tests the Card Description field.
   */
  public function testField() {
    $this->baseTestPlainTextField('field_card_description', 'Card Description');
  }

}
