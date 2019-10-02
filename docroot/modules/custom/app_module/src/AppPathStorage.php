<?php

namespace Drupal\app_module;

use Drupal\Core\Cache\Cache;
use Drupal\Core\Database\Connection;
use Drupal\Core\Database\DatabaseException;
use Drupal\Core\Extension\ModuleHandlerInterface;
use Drupal\Core\Language\LanguageInterface;

/**
 * Provides a class for CRUD operations on app module paths.
 *
 * All queries perform case-insensitive matching on the 'owner_source'
 * and 'owner_alias' fields, so the aliases '/test-alias' and '/test-Alias'
 * are considered to be the same, and will both refer to the same internal
 * system path.
 *
 * ASSUMPTIONS:
 * - An owner alias may have more than one app module instance.
 * - No more that 1 instance of a module type can exist for an alias.
 */
class AppPathStorage implements AppPathStorageInterface {
  /**
   * The table for the url_alias storage.
   */
  const TABLE = 'app_module_paths';
  /**
   * The database connection.
   *
   * @var \Drupal\Core\Database\Connection
   */
  protected $connection;
  /**
   * The module handler.
   *
   * @var \Drupal\Core\Extension\ModuleHandlerInterface
   */
  protected $moduleHandler;

  /**
   * Constructs a Path CRUD object.
   *
   * @param \Drupal\Core\Database\Connection $connection
   *   A database connection for reading and writing path aliases.
   * @param \Drupal\Core\Extension\ModuleHandlerInterface $module_handler
   *   The module handler.
   */
  public function __construct(Connection $connection, ModuleHandlerInterface $module_handler) {
    $this->connection = $connection;
    $this->moduleHandler = $module_handler;
  }

  /**
   * {@inheritdoc}
   */
  public function save(
    $owner_pid,
    $owner_source,
    $owner_alias,
    $app_module_id,
    $app_module_data = NULL,
    $langcode = LanguageInterface::LANGCODE_NOT_SPECIFIED,
    $pid = NULL
  ) {
    if ($owner_source[0] !== '/') {
      throw new \InvalidArgumentException(sprintf('Owner source path %s has to start with a slash.', $owner_source));
    }
    if ($owner_alias[0] !== '/') {
      throw new \InvalidArgumentException(sprintf('Owner alias path %s has to start with a slash.', $owner_alias));
    }
    $fields = [
      'owner_pid' => $owner_pid,
      'owner_source' => $owner_source,
      'owner_alias' => $owner_alias,
      'app_module_id' => $app_module_id,
      'app_module_data' => serialize($app_module_data),
      'langcode' => $langcode,
    ];
    // Insert or update the alias.
    if (empty($pid)) {
      $try_again = FALSE;
      try {
        $query = $this->connection->insert(static::TABLE)
          ->fields($fields);
        $pid = $query->execute();
      }
      catch (\Exception $e) {
        // If there was an exception, try to create the table.
        if (!$try_again = $this->ensureTableExists()) {
          // If the exception happened for other reason than the missing table,
          // propagate the exception.
          throw $e;
        }
      }
      // Now that the table has been created, try again if necessary.
      if ($try_again) {
        $query = $this->connection->insert(static::TABLE)
          ->fields($fields);
        $pid = $query->execute();
      }
      $fields['pid'] = $pid;
    }
    else {
      // Fetch the current values so that an update hook can identify what
      // exactly changed.
      try {
        $original = $this->connection->query('SELECT owner_pid, owner_source, owner_alias, app_module_id, app_module_data, langcode FROM {app_module_paths} WHERE pid = :pid', [':pid' => $pid])
          ->fetchAssoc();
      }
      catch (\Exception $e) {
        $this->catchException($e);
        $original = FALSE;
      }
      $query = $this->connection->update(static::TABLE)
        ->fields($fields)
        ->condition('pid', $pid);
      $pid = $query->execute();
      $fields['pid'] = $pid;
      $fields['original'] = $original;
    }
    if ($pid) {
      // Clear the cache out for the storage item.
      Cache::invalidateTags([AppPathStorageInterface::CACHE_TAG]);
      return $fields;
    }
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function load($conditions) {
    $select = $this->connection->select(static::TABLE);
    foreach ($conditions as $field => $value) {
      if ($field == 'owner_source' || $field == 'owner_alias') {
        // Use LIKE for case-insensitive matching.
        $select->condition($field, $this->connection->escapeLike($value), 'LIKE');
      }
      else {
        $select->condition($field, $value);
      }
    }
    try {
      $result = $select
        ->fields(static::TABLE)
        ->orderBy('pid', 'DESC')
        ->range(0, 1)
        ->execute()
        ->fetchAssoc();

      if ($result) {
        $path = [
          'pid' => $result['pid'],
          'owner_pid' => $result['owner_pid'],
          'owner_source' => $result['owner_source'],
          'owner_alias' => $result['owner_alias'],
          'app_module_id' => $result['app_module_id'],
          'app_module_data' => unserialize($result['app_module_data']),
          'langcode' => $result['langcode'],
        ];

        return $path;
      }
      else {
        return FALSE;
      }
    }
    catch (\Exception $e) {
      $this->catchException($e);
      return FALSE;
    }
  }

  /**
   * {@inheritdoc}
   */
  public function loadAll() {
    $select = $this->connection->select(static::TABLE);
    try {
      $paths = [];

      $result = $select
        ->fields(static::TABLE)
        ->orderBy('pid', 'DESC')
        ->execute();

      while ($record = $result->fetchAssoc()) {
        $paths[] = [
          'pid' => $record['pid'],
          'owner_pid' => $record['owner_pid'],
          'owner_source' => $record['owner_source'],
          'owner_alias' => $record['owner_alias'],
          'app_module_id' => $record['app_module_id'],
          'app_module_data' => unserialize($record['app_module_data']),
          'langcode' => $record['langcode'],
        ];
      }

      return $paths;
    }
    catch (\Exception $e) {
      $this->catchException($e);
      return [];
    }
  }

  /**
   * {@inheritdoc}
   */
  public function delete($conditions) {

    $query = $this->connection->delete(static::TABLE);
    foreach ($conditions as $field => $value) {
      if ($field == 'owner_source' || $field == 'owner_alias') {
        // Use LIKE for case-insensitive matching.
        $query->condition($field, $this->connection->escapeLike($value), 'LIKE');
      }
      else {
        $query->condition($field, $value);
      }
    }
    try {
      $deleted = $query->execute();
    }
    catch (\Exception $e) {
      $this->catchException($e);
      $deleted = FALSE;
    }
    // Clear the cache out for the storage item.
    Cache::invalidateTags([AppPathStorageInterface::CACHE_TAG]);

    return $deleted;
  }

  /**
   * Check if the table exists and create it if not.
   */
  protected function ensureTableExists() {
    try {
      $database_schema = $this->connection->schema();
      if (!$database_schema->tableExists(static::TABLE)) {
        $schema_definition = $this->schemaDefinition();
        $database_schema->createTable(static::TABLE, $schema_definition);
        return TRUE;
      }
    }
    // If another process has already created the table, attempting to recreate
    // it will throw an exception. In this case just catch the exception and do
    // nothing.
    catch (DatabaseException $e) {
      return TRUE;
    }
    return FALSE;
  }

  /**
   * Act on an exception when app_module_paths might be stale.
   *
   * If the table does not yet exist, that's fine, but if the table exists and
   * yet the query failed, then the app_module_paths is stale and the exception
   * needs to propagate.
   *
   * @param \Exception $e
   *   The exception.
   *
   * @throws \Exception
   */
  protected function catchException(\Exception $e) {
    if ($this->connection->schema()->tableExists(static::TABLE)) {

      throw $e;
    }
  }

  /**
   * Defines the schema for the {app_module_paths} table.
   *
   * @internal
   */
  public static function schemaDefinition() {
    return [
      'description' => 'A list of app module paths for cgov applications.',
      'fields' => [
        'pid' => [
          'description' => 'A unique app module path alias identifier.',
          'type' => 'serial',
          'unsigned' => TRUE,
          'not null' => TRUE,
        ],
        'owner_pid' => [
          'description' => 'A the owning path alias identifier.',
          'type' => 'int',
          'unsigned' => TRUE,
          'not null' => TRUE,
        ],
        'owner_source' => [
          'description' => 'The hosting entities Drupal path; e.g. node/12.',
          'type' => 'varchar',
          'length' => 255,
          'not null' => TRUE,
          'default' => '',
        ],
        'owner_alias' => [
          'description' => 'The hosting entities alias for this app module instance.',
          'type' => 'varchar',
          'length' => 255,
          'not null' => TRUE,
          'default' => '',
        ],
        'app_module_id' => [
          'description' => 'The machine name of the app module instance.',
          'type' => 'varchar',
          'length' => 255,
          'not null' => TRUE,
          'default' => '',
        ],
        'app_module_data' => [
          'description' => 'The serialized data of the app module instance.',
          'type' => 'text',
          'size' => 'normal',
          'not null' => FALSE,
        ],
        'langcode' => [
          'description' => "The language code this alias is for; if 'und', the alias will be used for unknown languages. Each Drupal path can have an alias for each supported language.",
          'type' => 'varchar_ascii',
          'length' => 12,
          'not null' => TRUE,
          'default' => '',
        ],
      ],
      'primary key' => ['pid'],
      'indexes' => [
        'owner_alias_langcode_pid' => ['owner_alias', 'langcode', 'pid'],
        'owner_source_langcode_pid' => ['owner_source', 'langcode', 'pid'],
        'appmodule_langcode_pid' => ['app_module_id', 'langcode', 'pid'],
      ],
      'unique keys' => [
        'owner_pid' => ['owner_pid'],
      ],
    ];
  }

}
