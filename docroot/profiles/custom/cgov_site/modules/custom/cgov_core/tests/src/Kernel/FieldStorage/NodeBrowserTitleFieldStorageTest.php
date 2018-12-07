<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

/**
 * Tests node Browser Title field storage.
 *
 * @group cgov_core
 */
class NodeBrowserTitleFieldStorageTest extends CGovFieldStorageTestBase {

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
   * Tests the Browser Title field.
   */
  public function testField() {
    $this->baseTestPlainTextField('field_browser_title', 'Browser Title');
  }

}
