
# DO NOT TRY AND RUN GIT WITHIN THE CONTAINER
(cause you can't)

## What is this?

## Running your development stack
1. Copy the `docker.env.sample` file to a file named `docker.env`. `docker.env` will not be tracked. This is where the containers' local overrides & secrets are managed.
1. Change the passwords in `docker.env` to be different than in the sample. If need be modify the virtual hosts list (APACHE_SITE_ALIAS) as well.
1. Run `docker-compose up -d` within this directory to start up the stack.

### Initial Setup of Machine
1. Install docker
1. (Mac only)Install dnsmasq - this will allow http://*.devbox to be routed to docker.
   1. `brew install dnsmasq`
   1. `sudo echo 'address=/devbox/127.0.0.1' >> /usr/local/etc/dnsmasq.conf`
   1. `sudo mkdir -p /etc/resolver`
   1. `echo 'nameserver 127.0.0.1' | sudo tee /etc/resolver/devbox` to setup DNS for the sites
   1. `sudo brew services restart dnsmasq`

### Initial Setup of Site

1. Run `docker exec -it docker_web_1 /bin/bash` to login to the web container
1. `cd /var/www`
1. `composer install` -- Install all vendor files
1. `blt setup` -- Perform the initial site install

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
  * MariaDB
* web
  * OS: Ubuntu Bionic
  * PHP 7.2
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
  * MariaDB Client



## Running the stack with XDebug
XDebug is the PHP runtime debugger. While it helpful in stepping through code, it has major performance implications. So XDebug is not enabled by default. The other annoying thing about XDebug is that it must be configured for your specific IDE.

*This is still being worked on*
TODO:
1. Setup the xdebug.ini overrides (VSCode & PHPStorm)
1. Edit docker.env and set `XDEBUG_SAPI` to `apache2` in order to enable the XDEBUG module for apache. (If you *really* need to debug
  command line, then set it to `cli`.)
    1. Check /etc/php/7.2/apache2/conf.d/xdebug.ini
2. Setup the docker-compose.override.yml.sample
3. Test & document

## Rebuilding the Stack
You should not need to at this point. So this section is TBD.

## TODO:
1. Work on debugging
1. Add in memcached
1. Add instructions for rebuilding / force rebuilding
1. Document DNSMASQ / How to setup host names
1. Create aliases for containered commands (blt, drush, composer?)
1. Make nice project name in composer so it is not just docker_svc_1
1. Avoid root
1. Configure settings to match env vars
1. Fix auto hook creation junk.
