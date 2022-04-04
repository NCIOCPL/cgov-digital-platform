<?php

namespace Drupal\Tests\json_data_field\Kernel;

use Drupal\Core\Entity\Entity\EntityViewDisplay;
use Drupal\entity_test\Entity\EntityTest;

/**
 * @coversDefaultClass \Drupal\json_data_field\Plugin\Field\FieldFormatter\JsonDataFieldFormatter
 *
 * @group json_data_field
 */
class JsonDataFieldFormatterTest extends KernelTestBase {

  /**
   * Tests that the formatter is rendering an empty array.
   */
  public function testFormatter() {
    $this->createTestField();

    // Loading a YAML file or a YAML string.
    $yaml_data = '';

    $entity_view_display = EntityViewDisplay::create([
      'targetEntityType' => 'entity_test',
      'bundle' => 'entity_test',
      'mode' => 'default',
    ]);
    $entity_view_display->setComponent('test_json_data_field', [
      'type' => 'json_data_formatter',
    ]);
    $entity_view_display->save();

    $entity = EntityTest::create([
      'test_json_data_field' => $yaml_data,
    ]);
    $entity->save();

    $build = $entity_view_display->build($entity);

    $content = $this->container->get('renderer')->renderRoot($build);
    $this->assertEquals($yaml_data, $content);
  }

  /**
   * Tests that the formatter is rendering data.
   */
  public function testFormatterWithData() {
    $this->createTestField([]);

    // Loading a YAML file or a YAML string.
    $yaml_file = \Drupal::service('extension.list.module')->getPath('json_data_field') . '/tests/JsonDataFieldTestData.yml';
    $yaml_data = file_get_contents($yaml_file);

    $entity_view_display = EntityViewDisplay::create([
      'targetEntityType' => 'entity_test',
      'bundle' => 'entity_test',
      'mode' => 'default',
    ]);
    $entity_view_display->setComponent('test_json_data_field', [
      'type' => 'json_data_formatter',
    ]);
    $entity_view_display->save();

    $entity = EntityTest::create([
      'test_json_data_field' => $yaml_data,
    ]);
    $entity->save();

    $json_data_field = $entity->test_json_data_field->value;

    $this->assertEquals($yaml_data, $json_data_field);
  }

}
