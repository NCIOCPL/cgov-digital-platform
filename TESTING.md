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

## Making Tests

* Test Methods begin with the word `test`
* Tests should live with your module in the a folder structure as:
  * `<module name>`
    * tests
      * src
        * Unit - Unit tests; those test that do not require Drupal and only use mocks.
        * Kernel - Kernel tests; those tests that require Drupal, but only call APIs. Requires a working simpletest db
        * Functional (coming soon); aka Browser tests. Those tests that interface with the Drupal admin web interfaces. Reqiures a working simpletest db and web site. This is not like a BeHat test, it ensures the functionality works, NOT how it visualy looks. (e.g. does the "Add new content type" button work?)
* Test Classes should have a `Drupal\Tests\<module name>\<type>` namespace
  * where `<module name>` is the module name (e.g. cgov_core)
  * where `<type>` is Unit, Kernel or Functional.
  * NOTE: folders under `<type>` need to be taken into account in the namespace. See the notes about PHPUnit tests on https://www.drupal.org/docs/develop/standards/psr-4-namespaces-and-autoloading-in-drupal-8 for more information.

Please check out a modules README.md for more specific information on how testing has been defined for that project.
