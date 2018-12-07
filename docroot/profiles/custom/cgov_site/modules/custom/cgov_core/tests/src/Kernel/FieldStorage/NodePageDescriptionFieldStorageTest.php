<?php

namespace Drupal\Tests\cgov_core\Kernel\FieldStorage;

/**
 * Tests node Page Description field storage.
 *
 *    This is also known as the Meta-Description.
 *
 * @group cgov_core
 */
class NodePageDescriptionFieldStorageTest extends CGovFieldStorageTestBase {

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
   * Tests the Page Description field.
   */
  public function testField() {
    $this->baseTestPlainTextField('field_page_description', 'Page Description');
  }

}
