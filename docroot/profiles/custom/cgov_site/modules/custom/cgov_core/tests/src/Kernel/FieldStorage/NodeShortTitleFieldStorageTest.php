<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

/**
 * Tests node Short Title field storage.
 *
 * @group cgov_core
 */
class NodeShortTitleFieldStorageTest extends CGovFieldStorageTestBase {

  /**
   * Modules to enable.
   *
   * @var array
   */
  public static $modules = [
    'user', 'system', 'file', 'field', 'node', 'text', 'filter', 'workflows', 'content_moderation',
    'language', 'content_translation', 'cgov_core',
  ];

  /**
   * Tests the Short Title field.
   */
  public function testField() {
    $this->baseTestPlainTextField('field_short_title', 'Short Title');
  }

}
