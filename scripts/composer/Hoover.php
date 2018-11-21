<?php

namespace CGovPlatform\composer;

use Composer\Script\Event;
use Composer\IO\IOInterface;

/**
 * Implement cleanup utilities for the CGovPlatform project.
 */
class Hoover {

  /**
   * Emulate `make clean`.
   *
   * Cf. https://github.com/bryanpizzillo/cgov-digital-platform/issues/31
   */
  public static function clean(Event $event) {
    $io = $event->getIO();
    $io->write('<info>Cleaning Cancer.gov project tree ...</info>');
    $errors = self::cleanProjectTree($io);
    if ($errors) {
      $io->writeError("<error>$errors errors encountered.</error>");
      exit(1);
    }
    else {
      $io->write('<info>Project tree cleaned.</info>');
    }
  }

  /**
   * Clean the project tree.
   *
   * This prepares for a fresh `composer install`/`blt setup`, but preserves
   * the docker containers. This private helper method makes it possible
   * to implement another command later on which does the same work and some
   * other cleanup, without duplicating this code.
   *
   * @param Composer\IO\IOInterface $io
   *   Provides mechanism for communicating with the operator.
   *
   * @return int
   *   Number of errors encountered.
   */
  private static function cleanProjectTree(IOInterface $io) {
    $errors = 0;
    $targets = [
      'vendor',
      'docroot/core',
      'docroot/modules/contrib',
      'docroot/profiles/contrib',
      'docroot/themes/contrib',
    ];
    $git_root = exec('git rev-parse --show-toplevel');
    if (!$git_root) {
      $io->writeError('<error>Unable to find the repository root</error>');
      exit(1);
    }
    foreach ($targets as $target) {
      $path = "$git_root/$target";
      if (\file_exists($path)) {
        $io->write("<info>Removing $path ...</info>");
        $errors += \is_dir($path) ? self::rmdir($path, $io) : self::unlink($path, $io);
      }
    }
    return $errors;
  }

  /**
   * Delete the file at the specified location.
   *
   * @param string $path
   *   Location of the file to be removed.
   * @param Composer\IO\IOInterface $io
   *   Provides mechanism for communicating with the operator.
   *
   * @return int
   *   Number of errors (1 or 0).
   */
  private static function unlink(string $path, IOInterface $io) {
    if (!\unlink($path)) {
      $io->writeError("<error>Unable to delete $path</error>");
      return 1;
    }
    return 0;
  }

  /**
   * Recursively remove a directory and its contents.
   *
   * @param string $dir
   *   Location of the directory to be removed.
   * @param Composer\IO\IOInterface $io
   *   Provides mechanism for communicating with the operator.
   *
   * @return int
   *   Number of errors encountered.
   */
  private static function rmdir(string $dir, IOInterface $io) {

    // If this is a symbolic link, treat it like a file.
    if (\is_link($dir)) {
      return self::unlink($dir, $io);
    }

    // Keep track of how many problems arise.
    $errors = 0;
    $files = \array_diff(\scandir($dir), ['.', '..']);
    foreach ($files as $file) {
      $path = "$dir/$file";
      $errors = \is_dir($path) ? self::rmdir($path, $io) : self::unlink($path, $io);
    }

    // Give Windows a chance to catch up :-).
    $tries = 10;
    while ($tries-- > 0) {
      if (\rmdir($dir)) {
        return $errors;
      }
      \sleep(1);
    }

    // If we get here, we couldn't remove the directory (+1 for that error).
    $io->writeError("<error>Unable to remove $dir</error>");
    return $errors + 1;
  }

}
