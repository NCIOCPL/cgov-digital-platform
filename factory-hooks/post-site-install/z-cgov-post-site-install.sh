#!/bin/bash
#
# Factory Hook: post-site-install
#
# This is necessary so that blt drupal:install tasks are invoked automatically
# when a site is created on ACSF.
#
# Usage: post-site-install.sh sitegroup env db-role domain

# Exit immediately on error and enable verbose log output.
set -ev

# Map the script inputs to convenient names:
# Acquia Hosting sitegroup (application) and environment.
sitegroup="$1"
env="$2"
# Database role. This is a truly unique identifier for an ACSF site and is e.g.
# part of the public files path.
db_role="$3"
# Internal (Acquia managed) domain name of the website. (No public domain name
# is assigned yet, immediately after installation.) The first part is a name
# that is unique per installed site. A small but significant difference with
# $db_role: if a site gets deleted and reinstalled with the same name, it gets
# a different $db_role.
internal_domain="$4"
# To get only the site name in ${name[0]}:
IFS='.' read -a name <<< $internal_domain

# BLT executable:
blt="/mnt/www/html/$sitegroup.$env/vendor/acquia/blt/bin/blt"

## Lines above copied are from post-site-install.sh, but that script is called
## before this one, so need to repeat the blt command.

##########################################################
### ----------- Cgov Specific Tasks Here ------------- ###
###       Differences from db-update start here.       ###
##########################################################

$blt cgov:acsf:post-install --environment=$env --site=${name[0]} --define drush.uri=$internal_domain  --verbose --no-interaction -D drush.ansi=false
result=$?

if [[ $result != 0 ]]; then
  echo "Command execution returned status code: $result!\n";
  exit $result
fi
