
# DO NOT TRY AND RUN GIT WITHIN THE CONTAINER
(cause you can't)

## What is this?
The configuration needed for running the CGov Digital Platform in a docker compose stack. (As opposed to Vagrant, which has issues on Windows, and can be slow to recreate)

## Running your development stack
See [Onboarding information](https://github.com/NCIOCPL/cgov-digital-platform/wiki/Onboarding) on how to setup docker.

### Managing Virtual Hosts
At some point in time there will be multiple websites within our project. (e.g. www & dceg) You can add additional virtual hosts to the apache configuration by:
1. Edit `docker.env`
1. Add the new host name (space separated) to the `APACHE_SITE_ALIAS` variable.
1. Save the file
1. Restart the stack

## File Structure
* **db** - Directory containing the files needed for the database container. See [db/README.md](db/README.md) for more information.
* **web** - Directory containing the file needed for the web/tooling container.  See [web/README.md](web/README.md) for more information.
* README.md - This file
* `docker-compose.yml` - The compose project file
* *docker-compose.override.yml* - A docker compose override file which allows you to locally override anything in the docker-compose.yml. This is primarily used for volume mounts. This file is untracked in source control. This is not really required unless you have been told to create it! See https://runnable.com/docker/advanced-docker-compose-configuration for a good discussion of the file.
* `docker-compose.override.yml.sample` - A sample override file.
* *docker.env* - A file used to store environment variables (usually secrets or local configuration) which is "pushed" into each container within the docker-compose file. This file is untracked in source control.
* `docker.env.sample` - A sample docker environment variables file.

## Software
* db
  * OS:
  * MySQL
* web
  * OS: Ubuntu Bionic
  * PHP 8.1
    * bz2
    * cli
    * common
    * curl
    * fpm
    * gd
    * json
    * mbstring
    * memcached
    * mysql
    * oauth
    * opcache
    * readline
    * sqlite3
    * soap
    * xdebug
    * xml
  * Apache 2
  * Composer
  * Drush Launcher
  * curl
  * git
  * vim
  * MySQL Client



## Running the stack with XDebug
See [Debugging in VSCode](https://github.com/NCIOCPL/cgov-digital-platform/wiki/Debugging-in-VSCode)

## Rebuilding the Stack
You should not need to at this point. So this section is TBD.

## TODO:
1. Add in memcached
1. Add instructions for rebuilding / force rebuilding
1. Create aliases for containered commands (blt, drush, composer?)
1. Make nice project name in composer so it is not just docker_svc_1
1. Avoid root
1. Configure settings to match env vars
