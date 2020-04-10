# Cancer.gov Digital Platform

This project provides the Cancer.gov Digital Platform. A Drupal based Acquia BLT integrated solution with dependencies managed by [Composer](https://getcomposer.org/).

## Running the Development Environment
See [Docker Instructions](docker/README.md)

## Running cgov Tests
See [Testing Instructions](TESTING.md)

## Folder Structure
* **blt** - The BLT configuration
* **config** - The Drupal configuration (https://blt.readthedocs.io/en/9.x/configuration-management/)
* **docker** - The development stack.
* **docroot** - the web site
* **drush** - Drush configurations
* **patches** - local patch files
* **scripts** - utility scripts
  * **composer** - Composer scripts
  * **hooks** - Git hook scripts
* **tests** - BeHat and Unit tests

## IMPORTANT LINKS

* [How to apply a patch](https://github.com/NCIOCPL/cgov-digital-platform/wiki/Applying-Patches)
* [How to Update a Composer Package](https://github.com/NCIOCPL/cgov-digital-platform/wiki/Updating-a-Composer-Package)
* [How to Update Drupal Core](https://github.com/NCIOCPL/cgov-digital-platform/wiki/Updating-Drupal-Core)
