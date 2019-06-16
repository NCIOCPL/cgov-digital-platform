#!/bin/bash
#
# Factory Hook: db-update
#
# These are cgov digital platform post tasks on update. I am leaving db-update.sh alone as
# to simplify diffing blt and acsf module updates. This is pretty much copied verbatim.
#

# Exit immediately on error and enable verbose log output.
set -ev

# Acquia hosting site / environment names
site="$1"
env="$2"
# database role. (Not expected to be needed in most hook scripts.)
db_role="$3"
# The public domain name of the website.
domain="$4"

# BLT executable:
blt="/mnt/www/html/$site.$env/vendor/acquia/blt/bin/blt"

# You need the URI of the site factory website in order for drush to target that
# site. Without it, the drush command will fail. Use the uri.php file provided by the acsf module to
# locate the URI based on the site, environment and db role arguments.
uri=`/usr/bin/env php /mnt/www/html/$site.$env/hooks/acquia/uri.php $site $env $db_role`

# Create array with site name fragments from ACSF uri.
IFS='.' read -a name <<< "${uri}"

# Create and set Drush cache to unique local temporary storage per site.
# This approach isolates drush processes to completely avoid race conditions
# that persist after initial attempts at addressing in BLT: https://github.com/acquia/blt/pull/2922

cacheDir=`/usr/bin/env php /mnt/www/html/$site.$env/vendor/acquia/blt/scripts/blt/drush/cache.php $site $env $uri`

# Print to cloud task log.
echo "Generated temporary drush cache directory: $cacheDir."

# Print to cloud task log.
echo "Running BLT update locales on $uri domain in $env environment on the $site subscription."

##########################################################
### ----------- Cgov Specific Tasks Here ------------- ###
###       Differences from db-update start here.       ###
##########################################################
DRUSH_PATHS_CACHE_DIRECTORY=$cacheDir $blt cgov:acsf:db-update --environment=$env --site=${name[0]} --define drush.uri=$domain --verbose --yes --no-interaction -D drush.ansi=false

set +v
