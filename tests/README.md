This directory should contain automated tests, organized into subdirectories according to testing tool.

Please see [BLT documentation](http://blt.readthedocs.io/en/latest/readme/testing) for more information.

7/14/23 To run the Behat commands which have been converted to Cypress, follow these steps:
1. Run docker-compose -f ./docker/docker-compose.yml up -d
2. Enter the container using docker-compose -f ./docker/docker-compose.yml exec web bash
3. Run blt cgov:reinstall --no-interaction
4. Run blt drupal:install --no-interaction to install just drupal. This is what you will need to run every time you need to test the script. This also runs npm ci for you, you will not need to run it yourself. 
5. Run the test command. At the moment npm run blt:tests:cypress will do the job, but it will be coded to a blt:tests command to be run using blt. 