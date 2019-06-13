<?php

/**
 * @file
 * Implementation of any core settings.
 *
 * @see https://docs.acquia.com/site-factory/tiers/paas/workflow/hooks
 */

 /*
 * Set the translation path to allow for easy management of third-party
 * translation files. The installer ignores the path for the initial install,
 * but it will honor the use source. (It is here as configs will not be set
 * before the installation starts.)
 *
 * There is a known issue where the installer will not honor the override for the
 * path because it is hardcoded in the installer code.
 * https://www.drupal.org/project/drupal/issues/2689305
 */
$config['locale.settings']['translation']['use_source'] = 'local';
$config['locale.settings']['translation']['path'] = DRUPAL_ROOT . '/translations';
