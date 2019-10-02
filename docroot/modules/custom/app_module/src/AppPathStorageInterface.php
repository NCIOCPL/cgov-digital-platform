<?php

namespace Drupal\app_module;

use Drupal\Core\Language\LanguageInterface;

/**
 * Provides a class for CRUD operations on app module paths.
 *
 * For performance reasons, we need to quickly query the entity aliases for
 * any entity that references an application module. As the app_module
 * module does not, and should not, understand the exact implementation of
 * an entities handling of AppModuleReferenceItem field(s), we need to store
 * a quick lookup of Entity Aliases -> AppModule instance. This will support
 * the routing and execution of app modules.
 *
 * ASSUMPTIONS:
 * - An owner alias may have more than one app module instance.
 * - No more that 1 instance of a module type can exist for an alias.
 */
interface AppPathStorageInterface {

  /**
   * Cache tag for storage.
   *
   * @var string
   */
  const CACHE_TAG = 'app-module-paths';

  /**
   * Saves a app module path alias to the database.
   *
   * @param int $owner_pid
   *   The PID for the assocated alias.
   * @param string $owner_source
   *   The owning entities internal system path.
   * @param string $owner_alias
   *   The owning entities URL alias.
   * @param string $app_module_id
   *   The id of the app module.
   * @param string $app_module_data
   *   The serialized data of this app module instance.
   * @param string $langcode
   *   (optional) The language code of the alias.
   * @param int|null $pid
   *   (optional) Unique path alias identifier.
   *
   * @return array|false
   *   FALSE if the path could not be saved or an associative array containing
   *   the following keys:
   *   - owner_pid (int): The PID for the associated alias.
   *   - owner_source (string): The internal system path with a starting slash.
   *   - owner_alias (string): The URL alias with a starting slash.
   *   - app_module_id (string): The id of the app module.
   *   - app_module_data (string): The data for the instance of the app module.
   *   - pid (int): Unique path alias identifier.
   *   - langcode (string): The language code of the alias.
   *   - original: For updates, an array with source, alias and langcode with
   *     the previous values.
   *
   * @thrown \InvalidArgumentException
   *   Thrown when either the source or alias has not a starting slash.
   */
  public function save(
    $owner_pid,
    $owner_source,
    $owner_alias,
    $app_module_id,
    $app_module_data,
    $langcode = LanguageInterface::LANGCODE_NOT_SPECIFIED,
    $pid = NULL);

  /**
   * Fetches a specific app module path from the database.
   *
   * The default implementation performs case-insensitive matching on the
   * 'owner_source' and 'owner_alias' strings.
   *
   * @param array $conditions
   *   An array of query conditions.
   *
   * @return array|false
   *   FALSE if no alias was found or an associative arrays containing
   *   the following keys from the FIRST MATCH:
   *   - owner_pid (int): The PID for the associated alias.
   *   - owner_source (string): The internal system path with a starting slash.
   *   - owner_alias (string): The URL alias with a starting slash.
   *   - app_module_id (string): The id of the app module.
   *   - app_module_data (string): The data for the instance of the app module.
   *   - pid (int): Unique path alias identifier.
   *   - langcode (string): The language code of the alias.
   */
  public function load(array $conditions);

  /**
   * Fetches all the app module paths from the database.
   *
   * @return array
   *   An array of app paths for the langcode, or an empty array if none found,
   *   containing the following keys:
   *   - owner_pid (int): The PID for the associated alias.
   *   - owner_source (string): The internal system path with a starting slash.
   *   - owner_alias (string): The URL alias with a starting slash.
   *   - app_module_id (string): The id of the app module.
   *   - app_module_data (string): The data for the instance of the app module.
   *   - pid (int): Unique path alias identifier.
   *   - langcode (string): The language code of the alias.
   */
  public function loadAll();

  /**
   * Deletes a app maodule path.
   *
   * The default implementation performs case-insensitive matching on the
   * 'owner_source' and 'owner_alias' strings.
   *
   * NOTE: When an app module is deleted, need to delete the aliases.
   *
   * @param array $conditions
   *   An array of criteria.
   */
  public function delete(array $conditions);

}
