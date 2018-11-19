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
    $io = $event->getIO();
    $io->write("CGov Project Initialization: Begin");

    //Get project root path
    $project_root = join([ __DIR__, "../.." ], "/");

    $bltFile = array(
        "path" => join([$project_root, "blt"], "/"),
        "sample" => "example.local.blt.yml",
        "real" => "local.blt.yml"
    );

    $dockerenvFile = array(
      "path" => join([$project_root, "docker"], "/"),
      "sample" => "docker.env.sample",
      "real" => "docker.env"
    );

    $filesToCopy = [
      $bltFile,
      $dockerenvFile
    ];

    //Validate 
    $encounteredError = false;
    foreach($filesToCopy as $fileInfo) {
      if (!CGovScriptHandler::isLocalFileValid($fileInfo)) {
        $io->writeError(
          sprintf(
            '<error>CGov Project Initialization: ERROR %s already exists. Cleanup first.</error>',
            $fileInfo["real"]
          )
        );
        $encounteredError = true;
      }
    }

    if ($encounteredError) {
      $io->writeError(
        sprintf(
          '<error>CGov Project Initialization: Existing files. Exiting.</error>',
          $fileInfo["real"]
        )
      );
      exit(1);
    }

    //Copy the files
    foreach($filesToCopy as $fileInfo) {
      CGovScriptHandler::copyLocalFile($fileInfo);
    }

    $event->getIO()->write("CGov Project Initialization: Complete");
  }

  /**
   * Checks to see if a init file does not already exist
   *
   * @param [type] $fileInfo Information about the file to check
   * @return boolean
   */
  private static function isLocalFileValid($fileInfo) {
    return !file_exists(join([ $fileInfo["path"], $fileInfo["real"] ],"/"));
  }

  /**
   * Copies a sample config file to a real file
   *
   * @param [Object] 
   * @return void
   */
  private static function copyLocalFile($fileInfo) {
    copy(
      join([ $fileInfo["path"], $fileInfo["sample"] ], "/"),
      join([ $fileInfo["path"], $fileInfo["real"] ], "/")
    );
  }
}
