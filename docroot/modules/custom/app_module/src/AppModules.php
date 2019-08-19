<?php

namespace Drupal\app_module;

/**
 * Static service container wrapper for app modules.
 */
class AppModules {

  /**
   * Returns an array of all app modules as fully loaded $app_module objects.
   *
   * @return \Drupal\app_module\Entity\AppModule[]
   *   An array of loaded app module entities.
   */
  public static function getAllAppModules() {
    return \Drupal::entityManager()->getStorage('app_module')->loadMultiple();
  }

  /**
   * Returns an array of all enabled app modules.
   *
   * @return \Drupal\app_module\Entity\AppModule[]
   *   An array of loaded enabled app modules entities.
   */
  public static function getEnabledAppModules() {
    $query = \Drupal::entityQuery('app_module')
      ->condition('status', TRUE)
      ->execute();
    return \Drupal::entityManager()->getStorage('app_module')->loadMultiple($query);
  }

}
