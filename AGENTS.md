# AGENTS.md

This repository contains a Drupal 10.6 multi-site codebase for the NCI Digital Platform (AKA Cgov Digital Platform). The codebase is hosted in the Acquia Multi-experience Operations (MEO) service. Local development is done through ddev.

# Project Structure

This project follows a normal Drupal 10+ site that was created using `drupal/core-composer-scaffold`.

Some highlights:
* `/docroot/profiles/custom/cgov_site` - The installation profile for the Drupal codebase. All sites hosted within MEO use this installation profile.
* `/docroot/profiles/custom/cgov_site/themes/custom/ncids_trans` - this is the Drupal front-end theme.
* `/docroot/profiles/custom/cgov_site/themes/custom/ncids_trans/front-end` - this is a webpack-based project that build the javascript and css code from typescript and sass files.
* `/docroot/profiles/custom/cgov_site/themes/custom/cgov` - this is the location of legacy JS and CSS that we are in the process of removing. All of this code is deprecated and should never be modified.
* `/tests/cypress` - Cypress-based integration tests. We use the  `cypress-cucumber-preprocessor` package for Gherkin support.
* `/blt` - we are using Acquia BLT/Robo for automating Drupal tasks. This folder contains our custom tasks.
* `/drush` - custom drush commands that do no rely on our profile are here.

# Developer commands
As we are using ddev to host our development sites, all commands must be run inside the correct ddev Docker container. You can do this by preferencing any normal Drupal command with `ddev`. Running `ddev help` in the root of this project will list all the available commands.

Some key commands are:
* `ddev blt` - run any `blt` command inside the web container.
* `ddev composer` - run any `composer` command inside the web container.
* `ddev drush` - run any `drush` command inside the web container.
* `ddev exec` - run any shell command inside the web container.
* `ddev npm` - run any `npm` command inside the web container.
* `ddev php` - run any `php` command inside the web container.

If at any point you must re-install all composer packages, such as when switching branches or re-applying patchfiles through composer (`cweagans/composer-patches`) you must run `ddev composer cgov-clean && ddev composer install`. `ddev composer cgov-clean` ensures no removed packages are left behind.

If asked by a developer to reinstall Drupal you can run `ddev blt cgov:reinstall`. Only do this when asked to as this takes around 7-12 minutes and resets the database.

# Code Quality

## Drupal Code
* Changes to php code should require a run of:
  * `ddev blt validate:php` to lint php files by itself
  * `ddev blt validate:phpcs` to run phpcs by itself
  * `ddev blt validate:phpstan` to run phpstan by itself
* Changes to twig files should run:
  * `ddev blt validate:twig`
* Changes to yaml files should run:
  * `ddev blt validate:yaml`
* Composer.json changes require:
  * `ddev blt validate:composer`

### Running Drupal Tests
NOTE: You should not attempt to run Drupal tests at this time unless you have been specifically given the command to run. (They take upwards of 20-40 min to execute.)

To run all tests run: `ddev blt tests:drupal:run`

## ncids_theme front-end code
NOTE: the developer using this repository must have done a `ddev npm --prefix /var/www/html/docroot/profiles/custom/cgov_site/themes/custom/ncids_trans/front-end ci` in order for the node_modules to be installed.

* Changes to javascript, typescript, css, or sass in `/docroot/profiles/custom/cgov_site/themes/custom/ncids_trans/front-end`:
  1. `ddev npm --prefix /var/www/html/docroot/profiles/custom/cgov_site/themes/custom/ncids_trans/front-end run lint` to run the linter
  2. `ddev npm --prefix /var/www/html/docroot/profiles/custom/cgov_site/themes/custom/ncids_trans/front-end run test` to run unit tests

## Cypress test changes
You should not try to run cypress tests at this time.
