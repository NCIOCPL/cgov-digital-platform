## Test Environment Setup
The test setup is a bit convoluted as of 11/20. It was setup based on https://www.drupal.org/docs/8/phpunit/running-phpunit-tests. For information on the various types of tests possible, see https://www.lullabot.com/articles/an-overview-of-testing-in-drupal-8. (You will need to know this for the folder structure below)

## Important Bits
We have done the following:
* Configured phpunit in the blt.yml file to use the Drupal core PHPUnit configuration
* Set SIMPLETEST_* environment variables in the docker.env file so that Simple Test knows what database to connect to.
* TODO: Setup the additional configuration that will allow the Functional/Browser tests to work correctly. (Hostname is set, but we would need addional configuration in the web container to make it respond to we requests)

As a full Drupal stack is required, test must be run inside of the container.

## Running tests

To make testing work you must:
* run it inside of our [docker stack](./docker/README.md).
* ensure that you have already completed [3. Initial Setup of Site](./docker/README.md#3-initial-setup-of-site)

Run `blt test:phpunit`

## Folder Structure
* src
  * Kernel - Kernel tests go here
  * Unit - Unit tests go here
  * Functional - Browser tests go here -- Coming Soon!
