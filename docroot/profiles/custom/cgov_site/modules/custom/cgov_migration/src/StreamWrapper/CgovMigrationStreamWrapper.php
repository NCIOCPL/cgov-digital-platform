<?php

namespace Drupal\cgov_migration\StreamWrapper;

use Drupal\Component\Utility\UrlHelper;
use Drupal\Core\StreamWrapper\LocalStream;
use Drupal\Core\StreamWrapper\StreamWrapperInterface;
use Drupal\Core\Site\Settings;

/**
 * Defines a stream wrapper class from migration data (migration://)
 *
 * Provides support for storing migration data in a directory
 * under the cgov_migration module.  Based on
 * Drupal\Core\StreamWrapper\PublicStream.
 */
class CgovMigrationStreamWrapper extends LocalStream {

  /**
   * {@inheritdoc}
   */
  public static function getType() {
    return StreamWrapperInterface::LOCAL_HIDDEN;
  }

  /**
   * {@inheritdoc}
   */
  public function getName() {
    return 'Migration data files';
  }

  /**
   * {@inheritdoc}
   */
  public function getDescription() {
    return 'Migration data files stored in the cgov_migration module.';
  }

  /**
   * {@inheritdoc}
   */
  public function getDirectoryPath() {
    return static::basePath();
  }

  /**
   * {@inheritdoc}
   */
  public function getExternalUrl() {
    $path = str_replace('\\', '/', $this->getTarget());
    return static::baseUrl() . '/' . UrlHelper::encodePath($path);
  }

  /**
   * Finds and returns the base URL for public://.
   *
   * Defaults to the current site's base URL plus directory path.
   *
   * Note that this static method is used by \Drupal\system\Form\FileSystemForm
   * so you should alter that form or substitute a different form if you change
   * the class providing the stream_wrapper.public service.
   *
   * @return string
   *   The external base URL for public://
   */
  public static function baseUrl() {
    $settings_base_url = Settings::get('file_public_base_url', '');
    if ($settings_base_url) {
      return (string) $settings_base_url;
    }
    else {
      return $GLOBALS['base_url'] . '/' . static::basePath();
    }
  }

  /**
   * Returns the base path for migration:// (base folder for cgov_migration).
   *
   * @return string
   *   The base path for migration://,
   *   typically {project_root}docroot/profiles/custom/cgov_site/modules/custom/cgov_migration/.
   */
  public static function basePath() {

    // Get the path to this module.
    // Dependency injection does not work with stream wrappers.
    $module_handler = \Drupal::service('module_handler');
    $modulePath = $module_handler->getModuleDirectories()['cgov_migration'];

    if ($_ENV['MIGRATION'] == NULL) {
      $siteDirectory = 'CGOV';
    }
    else {
      $siteDirectory = trim($_ENV['MIGRATION']);
    }

    $path = rtrim($modulePath, '/') . '/migrations/' . $siteDirectory;
    return $path;
  }

}
