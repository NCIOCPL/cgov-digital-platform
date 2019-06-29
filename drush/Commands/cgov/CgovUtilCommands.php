<?php

namespace Drush\Commands\cgov;

use Drush\Drush;
use Drupal\Core\DrupalKernel;
use Drupal\Core\Cache\Cache;
use Drupal\Core\Site\Settings;
use Drush\Commands\DrushCommands;

/**
 * A Drush commandfile for Cgov utility commands.
 */
class CgovUtilCommands extends DrushCommands {

  /**
   * Clears caches even if Drupal is not installed.
   *
   * Clearing caches used to not be an issue when we reinstalled
   * from scratch each time. This was because the caches were
   * tables in the DB that got dropped each time Drupal was installed.
   * Now that we have memcache, memcache will keep the old caches
   * loaded. So this will clear all caches even if Drupal is not
   * installed.
   *
   * @command cgov:destroy-caches
   * @aliases destroy-caches
   * @usage drush cgov:destroy-caches
   *   Cleans up caches.
   * @bootstrap site
   */
  public function destroyCaches() {

    // Stealing a log from drush cr.
    chdir(DRUPAL_ROOT);

    $autoloader = $this->loadDrupalAutoloader(DRUPAL_ROOT);
    require_once DRUSH_DRUPAL_CORE . '/includes/utility.inc';

    $request = Drush::bootstrap()->getRequest();
    // Manually resemble early bootstrap of DrupalKernel::boot().
    require_once DRUSH_DRUPAL_CORE . '/includes/bootstrap.inc';
    DrupalKernel::bootEnvironment();

    // Avoid 'Only variables should be passed by reference'.
    $root = DRUPAL_ROOT;
    $site_path = DrupalKernel::findSitePath($request);
    Settings::initialize($root, $site_path, $autoloader);

    // Instead of drupal_rebuild, let's get to the caches.
    // The following code gets drupal to a point where the
    // cache bins will have been setup.
    $kernel = new DrupalKernel('prod', $autoloader);
    $kernel->setSitePath(DrupalKernel::findSitePath($request));

    // Prepare a NULL request.
    $kernel->prepareLegacyRequest($request);

    // This code is the bit that actually clears the cache
    // bins. Luckily deleting a bin that may not exist (DB)
    // does not throw errors.
    foreach (Cache::getBins() as $bin) {
      $bin->deleteAll();
    }

    // Calling flush_all_caches will fail if there is no DB.
    $this->logger()->success(dt('Cache destroy complete.'));
  }

  /**
   * Loads the Drupal autoloader and returns the instance.
   */
  public function loadDrupalAutoloader($drupal_root) {
    static $autoloader = FALSE;

    $autoloadFilePath = $drupal_root . '/autoload.php';
    if (!$autoloader && file_exists($autoloadFilePath)) {
      $autoloader = require $autoloadFilePath;
    }

    if ($autoloader === TRUE) {
      // The autoloader was already required. Assume that Drush and Drupal
      // share an autoloader per "Point autoload.php to the proper vendor
      // directory" - https://www.drupal.org/node/2404989.
      $autoloader = $this->autoloader();
    }

    return $autoloader;
  }

}
