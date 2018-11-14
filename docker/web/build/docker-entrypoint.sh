#!/usr/bin/env bash

# Any background job should have it's messages printed.
set -m

# Don't continue if any command in the script fails.
set -e

# Delete any previously existing run file.
if [ -f /run/apache2/apache2.pid ]; then
    rm /run/apache2/apache2.pid
fi

# Allow the Apache docroot to be overridden.
APACHE_DOCROOT_DIR="${APACHE_DOCROOT_DIR:-/var/www/html}"
if [ -n "$APACHE_DOCROOT_DIR" ]; then
     sed -i 's@^\s*DocumentRoot.*@'"        DocumentRoot ${APACHE_DOCROOT_DIR}"'@'  /etc/apache2/sites-available/000-default.conf
fi

# Allow the site name to be overriden.
APACHE_SITE_NAME="${APACHE_SITE_NAME:-docker.test}"
if [ -n "$APACHE_SITE_NAME" ]; then
     sed -i 's@^\s*ServerName.*@'"        ServerName ${APACHE_SITE_NAME}"'@'  /etc/apache2/sites-available/000-default.conf
fi

# Allow for site aliases to be provided.
APACHE_SITE_ALIAS="${APACHE_SITE_ALIAS:-docker.localhost}"
if [ -n "$APACHE_SITE_ALIAS" ]; then
     sed -i 's@^\s*ServerAlias.*@'"        ServerAlias ${APACHE_SITE_ALIAS}"'@'  /etc/apache2/sites-available/000-default.conf
fi

# Enable XDebug PHP module. When enabled, system performance will be affected.
# additionally /etc/php/7.2/mods-available/xdebug.ini is required to be mounted
# and setup for the appropriate debugger
XDEBUG_SAPI="${XDEBUG_SAPI:NONE}"
if [ "$XDEBUG_SAPI" == "cli" ]; then
    /usr/sbin/phpenmod -s cli xdebug
    /usr/sbin/phpdismod -s apache2 xdebug
elif [ "$XDEBUG_SAPI" == "apache2" ]; then
    /usr/sbin/phpenmod -s apache2 xdebug
    /usr/sbin/phpdismod -s cli xdebug
elif [ "$XDEBUG_SAPI" == "all" ]; then
    /usr/sbin/phpenmod -s cli xdebug
    /usr/sbin/phpenmod -s apache2 xdebug
else
    /usr/sbin/phpdismod -s cli xdebug
    /usr/sbin/phpdismod -s apache2 xdebug
fi


# Now that we're set up, run whatever command was passed to the entrypoint.
exec "$@"
