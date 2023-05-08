<?php

namespace Drupal\Tests\json_data_field\Kernel;

use Drupal\Core\Database\Connection;
use Drupal\entity_test\Entity\EntityTest;

/**
 * @coversDefaultClass \Drupal\json_data_field\Plugin\Field\FieldType\JSONItem
 *
 * @group json_data_field
 */
class JsonDataFieldItemTest extends KernelTestBase {

  /**
   * Tests that field values are saved a retrievable.
   */
  public function testFieldCreate() {
    $this->createTestField();
    // Loading a YAML file or a YAML string.
    $yaml_file = \Drupal::service('extension.list.module')->getPath('json_data_field') . '/tests/JsonDataFieldTestData.yml';
    $yaml_data = file_get_contents($yaml_file);

    $entity = EntityTest::create([
      'test_json_data_field' => $yaml_data,
    ]);
    $entity->save();

    $json_data_field = $entity->test_json_data_field->value;

    $this->assertEquals($yaml_data, $json_data_field);
  }

  /**
   * Tests that default values are used when no value is added.
   */
  public function testFieldCreateWithDefaultValue() {
    // Loading a YAML file or a YAML string.
    $yaml_file = \Drupal::service('extension.list.module')->getPath('json_data_field') . '/tests/JsonDataFieldTestData.yml';
    $yaml_data = file_get_contents($yaml_file);

    $field_settings = [
      'default_value' => [
        0 => [
          'value' => $yaml_data,
        ],
      ],
    ];
    $this->createTestField([], $field_settings);

    $entity = EntityTest::create([]);
    $entity->save();

    $json_data_field = $entity->test_json_data_field->value;

    $this->assertEquals($yaml_data, $json_data_field);
  }

  /**
   * Tests the validators.
   */
  public function testValidation() {
    $this->createTestField();

    $entity = EntityTest::create([
      'test_json_data_field' => "description: 'This is a root level menu link' entity: menu_link_content",
    ]);
    $entity->save();

    $violations = $entity->validate();
    $this->assertCount(2, $violations, 'Yaml Content must be valid YAML Data.');

    // Loading a YAML file or a YAML string.
    $yaml_file = \Drupal::service('extension.list.module')->getPath('json_data_field') . '/tests/JsonDataFieldTestDataTwo.yml';
    $yaml_data = file_get_contents($yaml_file);
    $entity = EntityTest::create([
      'test_json_data_field' => $yaml_data,
    ]);
    $entity->save();

    $message = "Field entity_test.entity_test.test_json_data_field has an invalid JSONSchema public://json_data_field/schema.json";

    $violations = $entity->validate();
    $this->assertCount(2, $violations, $message);

  }

  /**
   * Get Table Schema.
   */
  protected function getTableSchema(Connection $connection, $table) {
    // Check this is MySQL.
    if ($connection->databaseType() !== 'mysql') {
      throw new \RuntimeException('This script can only be used with MySQL database backends.');
    }

    $query = $connection->query("SHOW FULL COLUMNS FROM {" . $table . "}");
    $definition = [];
    while (($row = $query->fetchAssoc()) !== FALSE) {
      $name = $row['Field'];
      // Parse out the field type and meta information.
      preg_match('@([a-z]+)(?:\((\d+)(?:,(\d+))?\))?\s*(unsigned)?@', $row['Type'], $matches);
      $type = $this->fieldTypeMap($connection, $matches[1]);
      if ($row['Extra'] === 'auto_increment') {
        // If this is an auto increment, then the type is 'serial'.
        $type = 'serial';
      }
      $definition['fields'][$name] = [
        'type' => $type,
        'not null' => $row['Null'] === 'NO',
      ];
      if ($size = $this->fieldSizeMap($connection, $matches[1])) {
        $definition['fields'][$name]['size'] = $size;
      }
      if (isset($matches[2]) && $type === 'numeric') {
        // Add precision and scale.
        $definition['fields'][$name]['precision'] = $matches[2];
        $definition['fields'][$name]['scale'] = $matches[3];
      }
      elseif ($type === 'time' || $type === 'datetime') {
        // @todo Core doesn't support these, but copied from `migrate-db.sh` for now.
        // Convert to varchar.
        $definition['fields'][$name]['type'] = 'varchar';
        $definition['fields'][$name]['length'] = '100';
      }
      elseif (!isset($definition['fields'][$name]['size'])) {
        // Try use the provided length, if it doesn't exist default to 100. It's
        // not great but good enough for our dumps at this point.
        $definition['fields'][$name]['length'] = $matches[2] ?? 100;
      }

      if (isset($row['Default'])) {
        $definition['fields'][$name]['default'] = $row['Default'];
      }

      if (isset($matches[4])) {
        $definition['fields'][$name]['unsigned'] = TRUE;
      }

      // Check for the 'varchar_ascii' type that should be 'binary'.
      if (isset($row['Collation']) && $row['Collation'] == 'ascii_bin') {
        $definition['fields'][$name]['type'] = 'varchar_ascii';
        $definition['fields'][$name]['binary'] = TRUE;
      }

      // Check for the non-binary 'varchar_ascii'.
      if (isset($row['Collation']) && $row['Collation'] == 'ascii_general_ci') {
        $definition['fields'][$name]['type'] = 'varchar_ascii';
      }

      // Check for the 'utf8_bin' collation.
      if (isset($row['Collation']) && $row['Collation'] == 'utf8_bin') {
        $definition['fields'][$name]['binary'] = TRUE;
      }
    }

    // Set primary key, unique keys, and indexes.
    $this->getTableIndexes($connection, $table, $definition);

    // Set table collation.
    $this->getTableCollation($connection, $table, $definition);

    return $definition;
  }

  /**
   * Adds primary key, unique keys, and index information to the schema.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection to use.
   * @param string $table
   *   The table to find indexes for.
   * @param array &$definition
   *   The schema definition to modify.
   */
  protected function getTableIndexes(Connection $connection, $table, array &$definition) {
    // Note, this query doesn't support ordering, so that is worked around
    // below by keying the array on Seq_in_index.
    $query = $connection->query("SHOW INDEX FROM {" . $table . "}");
    while (($row = $query->fetchAssoc()) !== FALSE) {
      $index_name = $row['Key_name'];
      $column = $row['Column_name'];
      // Key the arrays by the index sequence for proper ordering (start at 0).
      $order = $row['Seq_in_index'] - 1;

      // If specified, add length to the index.
      if ($row['Sub_part']) {
        $column = [$column, $row['Sub_part']];
      }

      if ($index_name === 'PRIMARY') {
        $definition['primary key'][$order] = $column;
      }
      elseif ($row['Non_unique'] == 0) {
        $definition['unique keys'][$index_name][$order] = $column;
      }
      else {
        $definition['indexes'][$index_name][$order] = $column;
      }
    }
  }

  /**
   * Set the table collation.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection to use.
   * @param string $table
   *   The table to find indexes for.
   * @param array &$definition
   *   The schema definition to modify.
   */
  protected function getTableCollation(Connection $connection, $table, array &$definition) {
    $query = $connection->query("SHOW TABLE STATUS LIKE '{" . $table . "}'");
    $data = $query->fetchAssoc();

    // Set `mysql_character_set`. This will be ignored by other backends.
    if (isset($data['Collation'])) {
      $definition['mysql_character_set'] = str_replace('_general_ci', '', $data['Collation']);
    }
  }

  /**
   * Gets all data from a given table.
   *
   * If a table is set to be schema only, and empty array is returned.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection to use.
   * @param string $table
   *   The table to query.
   *
   * @return array
   *   The data from the table as an array.
   */
  protected function getTableData(Connection $connection, $table) {
    $order = $this->getFieldOrder($connection, $table);
    $query = $connection->query("SELECT * FROM {" . $table . "} " . $order);
    $results = [];
    while (($row = $query->fetchAssoc()) !== FALSE) {
      $results[] = $row;
    }
    return $results;
  }

  /**
   * Given a database field type, return a Drupal type.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection to use.
   * @param string $type
   *   The MySQL field type.
   *
   * @return string
   *   The Drupal schema field type. If there is no mapping, the original field
   *   type is returned.
   */
  protected function fieldTypeMap(Connection $connection, $type) {
    // Convert everything to lowercase.
    $map = array_map('strtolower', $connection->schema()->getFieldTypeMap());
    $map = array_flip($map);

    // The MySql map contains type:size. Remove the size part.
    return isset($map[$type]) ? explode(':', $map[$type])[0] : $type;
  }

  /**
   * Given a database field type, return a Drupal size.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection to use.
   * @param string $type
   *   The MySQL field type.
   *
   * @return string
   *   The Drupal schema field size.
   */
  protected function fieldSizeMap(Connection $connection, $type) {
    // Convert everything to lowercase.
    $map = array_map('strtolower', $connection->schema()->getFieldTypeMap());
    $map = array_flip($map);

    $schema_type = explode(':', $map[$type])[0];
    // Only specify size on these types.
    if (in_array($schema_type, ['blob', 'float', 'int', 'text'])) {
      // The MySql map contains type:size. Remove the type part.
      return explode(':', $map[$type])[1];
    }
    return '';
  }

  /**
   * Gets field ordering for a given table.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   The database connection to use.
   * @param string $table
   *   The table name.
   *
   * @return string
   *   The order string to append to the query.
   */
  protected function getFieldOrder(Connection $connection, $table) {
    // @todo This is MySQL only since there are no Database API functions for
    // table column data.
    // @todo This code is duplicated in `core/scripts/migrate-db.sh`.
    $connection_info = $connection->getConnectionOptions();
    // Order by primary keys.
    $order = '';
    $query = "SELECT `COLUMN_NAME`
      FROM `information_schema`.`COLUMNS`
      WHERE (`TABLE_SCHEMA` = '" . $connection_info['database'] . "')
      AND (`TABLE_NAME` = '{" . $table . "}')
      AND (`COLUMN_KEY` = 'PRI')
      ORDER BY COLUMN_NAME";
    $results = $connection->query($query);
    while (($row = $results->fetchAssoc()) !== FALSE) {
      $order .= $row['COLUMN_NAME'] . ', ';
    }
    if (!empty($order)) {
      $order = ' ORDER BY ' . rtrim($order, ', ');
    }
    return $order;
  }

}
