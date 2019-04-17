<?php

namespace CGovPlatform\Tests;

/**
 * A custom class containing schema exclusions test cases.
 */
class CgovSchemaExclusions {

  /**
   * An array of config object names that are excluded from schema checking.
   *
   * @var string[]
   */
  public static $configSchemaCheckerExclusions = [
    'metatag.metatag_defaults.global',
    'metatag.metatag_defaults.node',
  ];

}
