#!/bin/bash
#
# This file is aimed to be invoked by Acquia Hosting's post-code-deploy hook.
#
# Usage: site-post-code-deploy.sh sitegroup env sitename domain

# Exit immediately on error and enable verbose log output.
set -ev

# Map the script inputs to convenient names:
# Acquia Hosting sitegroup (application) and environment.
sitegroup="$1"
env="$2"
# The public domain name of the website. If the site uses a path based domain,
# the path is appended (without trailing slash), e.g. "domain.com/subpath".
domain="$4"

# BLT wants the name of the website for the blt drupal:update command.
# Sitename.
sitename="$3"
# Source BLT environment helper
source "/mnt/www/html/$sitegroup.$env/scripts/blt/blt-env-helper.sh"

# Set up BLT executable and environment mapping
setup_blt_environment "$sitegroup" "$env"

echo "Running BLT deploy tasks on $sitename site in $env environment on the $sitegroup subscription."

# Run blt drupal:update tasks. The trailing slash behind the domain works
# around a bug in Drush < 9.6 for path based domains: "domain.com/subpath/" is
# considered a valid URI but "domain.com/subpath" is not.
$blt_executable drupal:update --environment=$blt_environment --site=$sitename --define drush.uri=$domain/ --verbose --no-interaction -D drush.ansi=false
$blt_executable cgov:meo:db-update --environment=$blt_environment --site=${sitename} --define drush.uri=$domain/ --verbose --no-interaction -D drush.ansi=false

# Clean up the drush cache directory.
echo "Removing temporary drush cache files."

set +v

# @todo Exit with the status of the BLT commmand. If the exit status is non-zero,
# Site Factory will send a notification of a failed 'blt drupal:update',
# interrupting the execution of additional db-update scripts.
