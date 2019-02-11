#!/bin/sh
#
# Cloud Hook: post-db-copy
#
# The post-db-copy hook is run whenever you use the Workflow page to copy a
# database from one environment to another. (Note this means it is run when
# staging a site but not when duplicating a site, because the latter happens on
# the same environment.) See ../README.md for details.
#
# Usage: post-db-copy site target-env db-role source-env

site="$1"
target_env="$2"
db_role="$3"
source_env="$4"

# You need the URI of the site factory website in order for drush to target that
# site. Without it, the drush command will fail. The uri.php file below will
# locate the URI based on the site, environment and db role arguments.
uri=`/usr/bin/env php /mnt/www/html/$site.$target_env/hooks/acquia/uri.php $site $target_env $db_role`

# Print a statement to the cloud log.
echo "$site.$target_env: Received copy of database from $uri ($source_env environment)."

# The websites' document root can be derived from the site/env:
docroot="/var/www/html/$site.$target_env/docroot"

# Acquia recommends the following two practices:
# 1. Hardcode the drush version.
# 2. When running drush, provide the docroot + url, rather than relying on
#    aliases. This can prevent some hard to trace problems.
DRUSH_CMD="drush8 --root=$docroot --uri=https://$uri"

# Retrieve the site name.
$DRUSH_CMD cget system.site name
