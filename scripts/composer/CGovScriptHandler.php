<?php

/**
 * @file
 * Contains \NCIProject\composer\ScriptHandler.
 */

namespace CGovPlatform\composer;

use Composer\Script\Event;
//use Composer\Semver\Comparator;
//use DrupalFinder\DrupalFinder;
//use Symfony\Component\Filesystem\Filesystem;
//use Webmozart\PathUtil\Path;

class CGovScriptHandler {

  /**
   * Initializes a fresh clone of the cgov-digital-platform
   */
  public static function initializeProject(Event $event) {
    
    echo "CGov Project Initialization: Begin";

    //Get BLT folder
    $project_root = join([ __DIR__, "../.." ], "/");

    
    $blt_file = array(
        "path" => join([$project_root, "blt"]),
        "sample" => "example.local.blt.yml",
        "real" => "local.blt.yml"
    );

    $dockerenv_file = array(
      "path" => join([$project_root, "docker"]),
      "sample" => "docker.env.sample",
      "real" => "docker.env"
    );

    $files_to_copy = [
      $blt_file,
      $dockerenv_file
    ];


    echo "CGov Project Initialization: Complete";
  }

  /**
   * Copies a sample config file to a real file
   *
   * @param [Object] 
   * @return void
   */
  private static function copySampleToReal($copyObj) {

  }

  /*
  public static function createRequiredFiles(Event $event) {
    $fs = new Filesystem();
    $drupalFinder = new DrupalFinder();
    $drupalFinder->locateRoot(getcwd());
    $drupalRoot = $drupalFinder->getDrupalRoot();

    $dirs = [
      'modules',
      'profiles',
      'themes',
    ];

    // Required for unit testing
    foreach ($dirs as $dir) {
      if (!$fs->exists($drupalRoot . '/'. $dir)) {
        $fs->mkdir($drupalRoot . '/'. $dir);
        $fs->touch($drupalRoot . '/'. $dir . '/.gitkeep');
      }
    }

    // Prepare the settings file for installation
    if (!$fs->exists($drupalRoot . '/sites/default/settings.php') and $fs->exists($drupalRoot . '/sites/default/default.settings.php')) {
      $fs->copy($drupalRoot . '/sites/default/default.settings.php', $drupalRoot . '/sites/default/settings.php');
      require_once $drupalRoot . '/core/includes/bootstrap.inc';
      require_once $drupalRoot . '/core/includes/install.inc';
      $settings['config_directories'] = [
        CONFIG_SYNC_DIRECTORY => (object) [
          'value' => Path::makeRelative($drupalFinder->getComposerRoot() . '/config/sync', $drupalRoot),
          'required' => TRUE,
        ],
      ];
      drupal_rewrite_settings($settings, $drupalRoot . '/sites/default/settings.php');
      $fs->chmod($drupalRoot . '/sites/default/settings.php', 0666);
      $event->getIO()->write("Create a sites/default/settings.php file with chmod 0666");
    }

    // Create the files directory with chmod 0777
    if (!$fs->exists($drupalRoot . '/sites/default/files')) {
      $oldmask = umask(0);
      $fs->mkdir($drupalRoot . '/sites/default/files', 0777);
      umask($oldmask);
      $event->getIO()->write("Create a sites/default/files directory with chmod 0777");
    }
  }
  **/


}
