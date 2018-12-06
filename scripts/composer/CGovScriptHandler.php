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

    // Get project root path (2 levels up)
    $project_root = dirname(dirname(__DIR__));

    $bltFile = array(
      "srcpath" => implode("/", [$project_root, "blt"]),
      "destpath" => implode("/", [$project_root, "blt"]),
      "sample" => "example.local.blt.yml",
      "real" => "local.blt.yml",
    );

    $dockerenvFile = array(
      "srcpath" => implode("/", [$project_root, "docker"]),
      "destpath" => implode("/", [$project_root, "docker"]),
      "sample" => "docker.env.sample",
      "real" => "docker.env",
    );

    $bashrcFile = array(
      "srcpath" => implode("/", [$project_root, "docker"]),
      "destpath" => implode("/", [getenv('HOME')]),
      "sample" => "docker.bashrc.sample.sh",
      "real" => ".docker.bashrc.sh",
    );

    $filesToCopy = [
      $bltFile,
      $dockerenvFile,
      $bashrcFile,
    ];

    $filesToSource = [
      $bashrcFile,
    ];

    // Validate to make sure the files do not exist.
    foreach ($filesToCopy as $fileInfo) {
      if (!CGovScriptHandler::isLocalFileValid($fileInfo)) {
        $io->writeError(
          sprintf(
            '<warning>CGov Project Initialization: %s already exists. Will not replace existing file.</warning>',
            implode("/", [$fileInfo["destpath"], $fileInfo["real"]])
          )
        );
      }
      else {
        // Copy the file into place.
        CGovScriptHandler::copyLocalFile($fileInfo);
        $io->write(sprintf('CGov Project Initialization: Created %s .', implode("/", [$fileInfo["destpath"], $fileInfo["real"]])));
      }
    }

    // Copy the files.
    foreach ($filesToSource as $fileInfo) {
      CGovScriptHandler::sourceLocalFile($fileInfo, $io);
    }

    $io->write("CGov Project Initialization: Complete");
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
    return !file_exists(implode("/", [$fileInfo["destpath"], $fileInfo["real"]]));
  }

  /**
   * Copies a sample config file to a real file.
   *
   * @param object $fileInfo
   *   The file information to copy.
   */
  private static function copyLocalFile($fileInfo) {
    copy(
      implode("/", [$fileInfo["srcpath"], $fileInfo["sample"]]),
      implode("/", [$fileInfo["destpath"], $fileInfo["real"]])
    );
  }

  /**
   * Copies a sample config file to a real file.
   *
   * @param object $fileInfo
   *   The file information to copy.
   * @param object $io
   *   The io handler use for displaying warnings/messages.
   */
  private static function sourceLocalFile($fileInfo, $io) {
    $home = getenv('HOME');

    // List files in search order.
    $startupFiles = ["$home/.profile", "$home/.bash_profile", "$home/.bashrc"];

    // Select the first startup file found for destination file to be updated.
    foreach ($startupFiles as $filename) {
      if (file_exists($filename)) {
        $startupFile = $filename;
        break;
      }
    }

    $destFile = implode("/", [$fileInfo["destpath"], $fileInfo["real"]]);
    $fileContents = file_get_contents($startupFile);

    // Code to be added to source file.
    $shellCode = "# added by 'composer cgov-init'\nsource $destFile\n";

    // Add shell code to startup file if it is not already there.
    if (strpos($fileContents, $shellCode) === FALSE) {
      // Append shellcode to startup file.
      $io->write("Adding $destFile to $startupFile");
      file_put_contents($startupFile, $fileContents . "\n" . $shellCode . "\n");

      // Notify user how to incorporate changes.
      $io->write("To update your shell settings, run 'source $startupFile' or log out and back in again.'");
    }
    else {
      // Display message that shell is already present.
      $io->writeError(
        sprintf("<warning>CGov Project Initialization: %s already reads in %s code. No changes made.</warning>",
          $startupFile, $destFile));
    }
  }

}
