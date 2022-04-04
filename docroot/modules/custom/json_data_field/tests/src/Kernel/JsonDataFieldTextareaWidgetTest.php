<?php

namespace Drupal\Tests\json_data_field\Kernel;

use Drupal\Core\Entity\Entity\EntityFormDisplay;

/**
 * @coversDefaultClass \Drupal\json_data_field\Plugin\Field\FieldWidget\JsonDataFieldWidget
 *
 * @group json_data_field
 */
class JsonDataFieldTextareaWidgetTest extends KernelTestBase {

  /**
   * Tests that we can save form settings without error.
   */
  public function testWidgetSettings() {
    $this->createTestField();

    $entity_form_display = EntityFormDisplay::create([
      'targetEntityType' => 'entity_test',
      'bundle' => 'entity_test',
      'mode' => 'default',
    ]);
    $entity_form_display->setComponent('test_json_data_field', ['type' => 'yaml_textarea']);
    $entity_form_display->save();
  }

}
