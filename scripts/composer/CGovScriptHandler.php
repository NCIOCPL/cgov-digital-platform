<?php

namespace CGovPlatform\composer;

use Composer\Script\Event;

/**
 * CGov Digital Platform Composer Script Handler.
 */
class CGovScriptHandler {

  /**
   * Initializes a fresh clone of the cgov-digital-platform.
   */
  public static function initializeProject(Event $event) {
    $io = $event->getIO();
    $io->write("CGov Project Initialization: Begin");

    // Get project root path.
    $project_root = implode("/", [__DIR__, "../.."]);

    $bltFile = array(
      "path" => implode("/", [$project_root, "blt"]),
      "sample" => "example.local.blt.yml",
      "real" => "local.blt.yml",
    );

    $dockerenvFile = array(
      "path" => implode("/", [$project_root, "docker"]),
      "sample" => "docker.env.sample",
      "real" => "docker.env",
    );

    $filesToCopy = [
      $bltFile,
      $dockerenvFile,
    ];

    // Validate to make sure the files do not exist.
    $encounteredError = FALSE;
    foreach ($filesToCopy as $fileInfo) {
      if (!CGovScriptHandler::isLocalFileValid($fileInfo)) {
        $io->writeError(
          sprintf(
            '<error>CGov Project Initialization: ERROR %s already exists. Cannot replace existing file!</error>',
            $fileInfo["real"]
          )
        );
        $encounteredError = TRUE;
      }
    }

    // If there was an error we need to exit.
    if ($encounteredError) {
      $io->writeError(
        sprintf(
          '<error>CGov Project Initialization: Existing files. Exiting.</error>',
          $fileInfo["real"]
        )
      );
      exit(1);
    }

    // Copy the files.
    foreach ($filesToCopy as $fileInfo) {
      CGovScriptHandler::copyLocalFile($fileInfo);
    }

    $event->getIO()->write("CGov Project Initialization: Complete");
  }

  /**
   * Checks to see if a init file does not already exist.
   *
   * @param object $fileInfo
   *   Information about the file to check.
   *
   * @return bool
   *   TRUE if the file does NOT exist.
   */
  private static function isLocalFileValid($fileInfo) {
    return !file_exists(implode("/", [$fileInfo["path"], $fileInfo["real"]]));
  }

  /**
   * Copies a sample config file to a real file.
   *
   * @param object $fileInfo
   *   The file information to copy.
   */
  private static function copyLocalFile($fileInfo) {
    copy(
      implode("/", [$fileInfo["path"], $fileInfo["sample"]]),
      implode("/", [$fileInfo["path"], $fileInfo["real"]])
    );
  }

}
