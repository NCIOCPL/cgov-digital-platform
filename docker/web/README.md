## What is it?
This is the Apache/Drupal service container and where the bulk of your interactions will be.

## Files in this folder
* Dockerfile - duh.
* build - files used during build
  * php-conf - All the PHP module configs. Anything that would ALWAYS be set can go in here.  See https://serversforhackers.com/c/lemp-managing-php-modules for information on that topic. If the settings are case by case, then you should create a runtime override.
  * docker-entrypoint.sh - The entrypoint to the container, which is a shell script that starts up apache.
* overrides - Add any files you may want to override. Files in this folder will be untracked.
* runtime - folder for files used during runtime. These are mounted as volumes into the container from the docker-compose file. These are not meant to be changed on local machines -- only mounted at runtime so when they are updated files do not require a containerrebuild.
  * php-conf - PHP module overrides
    * xdebug.ini - the very basic xdebug.ini
    * xdebug.ini.sample - A nice sample xdebug.
  * 000-default.conf -
  * apache2.conf -
  * php_apache2.ini - PHP ini for Apache
  * php_cli.ini - PHP ini for the command line - do not add XDebug unless you know what you are doing...
  * php.ini - Not used. Default php.ini
