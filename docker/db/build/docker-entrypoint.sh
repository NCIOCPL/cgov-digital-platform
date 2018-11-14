#!/usr/bin/env bash

# Any background job should have it's messages printed.
set -m

# Don't continue if any command in the script fails.
set -e

# Create the lock file directory.
mkdir -p -m 777 /var/run/mysqld/

# Define some variables, setting default values if necessary.
MYSQL_DATABASE=${MYSQL_DATABASE:-lullabot_db}
MYSQL_USER=${MYSQL_USER:-mysql}
MYSQL_PASSWORD=${MYSQL_PASSWORD:-password}
MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD:-root}
ADDITIONAL_DATABASES=${ADDITIONAL_DATABASES:-}

# Start the MySQL server in the background.
mysqld_safe &

# Wait a moment for MySQL to fully start up.
sleep 10

# Change the root password and grant remote access.
# Normally, this is a VERY BAD IDEA, but it's fine for local development.
mysql -u root -e "GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY '${MYSQL_ROOT_PASSWORD}';"

# Create a database with the given name, user, and password.
mysql -u root -e "CREATE DATABASE IF NOT EXISTS ${MYSQL_DATABASE}"
mysql -u root -e "GRANT ALL ON ${MYSQL_DATABASE}.* to '${MYSQL_USER}'@'%' IDENTIFIED BY '${MYSQL_PASSWORD}'"

# Create any additional databases if we asked for them.
if [ -n "$ADDITIONAL_DATABASES" ]; then
    for ADD_DB_NAME in $ADDITIONAL_DATABASES; do
      mysql -u root -e  "CREATE DATABASE IF NOT EXISTS $ADD_DB_NAME"
      mysql -u root -e  "GRANT ALL ON \`$ADD_DB_NAME\`.* TO '$MYSQL_USER'@'%' ;"
    done;
fi

# Flush any priviledges
mysql -u root -e "FLUSH PRIVILEGES"

# Shutdown our mysql server running in the background.
mysqladmin shutdown

# Now that we're set up, run whatever command was passed to the entrypoint.
exec "$@"
