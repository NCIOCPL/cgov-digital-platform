<?php

namespace Cgov\Blt\Plugin\Filesets;

// Do not remove this, even though it appears to be unused.
// @codingStandardsIgnoreLine
use Acquia\Blt\Annotations\Fileset;
use Acquia\Blt\Robo\Config\ConfigAwareTrait;
use Acquia\Blt\Robo\Filesets\FilesetsTrait;
use Robo\Contract\ConfigAwareInterface;

/**
 * Class Filesets.
 *
 * Each fileset in this class should be tagged with a @fileset annotation and
 * should return \Symfony\Component\Finder\Finder object.
 *
 * @package Acquia\Blt\Custom
 * @see \Acquia\Blt\Robo\Filesets\Filesets
 */
class CgovFilesets implements ConfigAwareInterface {
  use ConfigAwareTrait;
  use FilesetsTrait;

  /**
   * Get fileset php custom profiles.
   *
   * @fileset(id="files.php.cgov.profiles")
   *
   * @return \Symfony\Component\Finder\Finder
   *   Finder.
   */
  public function getFilesetPhpCustomProfiles() {
    $finder = $this->getPhpFilesetFinder();
    $finder->in([$this->getConfigValue('docroot') . '/profiles/custom']);
    return $finder;
  }

}
