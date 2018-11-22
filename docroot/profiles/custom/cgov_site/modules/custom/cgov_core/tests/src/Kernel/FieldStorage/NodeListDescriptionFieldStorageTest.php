<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

/**
 * Tests node List Description field storage.
 *
 * @group cgov_core
 */
class NodeListDescriptionFieldStorageTest extends CGovFieldStorageTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'user', 'system', 'field', 'node', 'text', 'filter', 'cgov_core',
  ];

  /**
   * Tests the List Description field.
   */
  public function testField() {
    $this->baseTestPlainTextField('field_list_description', 'List Description');
  }

}
