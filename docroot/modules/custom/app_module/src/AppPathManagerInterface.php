<?php

namespace Drupal\app_module;

use Drupal\Core\Entity\EntityInterface;
use Drupal\path_alias\PathAliasInterface;

/**
 * Find and register app module paths.
 *
 * NOTE: The AliasManagerInterface that we copied this from is used by both
 * Inbound and Outbound path processors to rewrite incoming urls to route paths
 * and rewrite route paths in links to aliases. We will not make any Outbound
 * path processors, so we will not need a commensurate getAliasByPath method.
 *
 * @see \Drupal\app_module\AppPathStorageInterface
 */
interface AppPathManagerInterface {

  /**
   * Helper function to ADD or UPDATE an app path for an entity.
   *
   * If an entity does not have an app path, one will be created.
   * If this is an update, then the app_module_id and app_module_data
   * will be updated.
   * The app_module module will handle updating the aliases for the entities
   * when they change.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   The entity to create the app module path entry for.
   * @param string $app_field_id
   *   The name of the app module reference field.
   */
  public function updateAppPath(EntityInterface $entity, $app_field_id = 'field_application_module');

  /**
   * Updates an app path's alias from a path info.
   *
   * @param \Drupal\path_alias\PathAliasInterface $path
   *   A path alias.
   */
  public function updateAliasFromPath(PathAliasInterface $path);

  /**
   * Delete's an app path based on a path info.
   *
   * @param \Drupal\path_alias\PathAliasInterface $path
   *   The removed path alias.
   */
  public function deleteByPath(PathAliasInterface $path);

  /**
   * Given a requested path, return the path it most closely matches.
   *
   * This gets us the alias, app_module_id and settings for an app module which
   * can be used by a path processor. This will see if the requested path
   * matches or begins with any of the app module paths.
   *
   * Examples:
   *   * App paths: /foo, /foo/bar/bazz
   *   * /foo would match the path with the alias /foo
   *   * /foo/bar would match the path with the alias /foo
   *   * /foo/bar/bazz/bleh would match the path with the alias /foo/bar/bazz
   *     even though there is also a /foo.
   *
   * NOTE: This is meant to be used by an InboundPathProcessor to replace the
   * processed path right before the AliasProcessor. So the $request_path
   * should not have language or any other additional strings added by other
   * processors. This is the parallel to the AliasManagerInterface's
   * getPathByAlias.
   *
   * @param string $request_path
   *   The requested path, which should be either an alias for an entity with
   *   an app module, or it should begin with the alias of an entity with an
   *   app module.
   * @param string $langcode
   *   An optional language code to look up the path in.
   *
   * @return array|null
   *   The app path record for the alias for the app module entity that most
   *   closely matches the requested path, or null if no matching paths were
   *   found.
   *
   * @throws \InvalidArgumentException
   *   Thrown when the request_path does not start with a slash.
   */
  public function getPathByRequest($request_path, $langcode = NULL);

  /**
   * Gets all registered app module paths.
   *
   * @param string $app_module_id
   *   An optional app module id to filter the paths by.
   *
   * @return array|null
   *   An array of app module paths.
   */
  public function getAllPaths($app_module_id = NULL);

  /**
   * Clear internal caches in alias manager.
   *
   * @param string $source
   *   Source path of the alias that is being inserted/updated. Can be omitted
   *   if entire cache needs to be flushed.
   */
  public function cacheClear($source = NULL);

}
