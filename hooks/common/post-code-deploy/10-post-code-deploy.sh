#!/bin/bash
#
# Cloud Hook: post-code-deploy
#
# The post-code-deploy hook is run whenever you use the Workflow page to
# deploy new code to an environment, either via drag-drop or by selecting
# an existing branch or tag from the Code drop-down list. See
# ../README.md for details.
#
# Usage: post-code-deploy site target-env source-branch deployed-tag repo-url
#                         repo-type

set -ev

## If this is MEO then exit.
if [[ $AH_SITE_GROUP == "ncigovmeo" ]]; then
  exit;
fi;

site="$1"
target_env="$2"
source_branch="$3"
deployed_tag="$4"
repo_url="$5"
repo_type="$6"

# Prep for BLT commands.
repo_root="/var/www/html/$site.$target_env"
export PATH=$repo_root/vendor/bin:$PATH
cd $repo_root

## If this is an ODE we would like things like toggle:modules to work. So we will
## pass in the target env as 'ode'. Then in blt.yml we can have an "ode" environment.
if [[ $target_env =~ ^ode\d* ]]; then
  target_env="ode";
fi

## Stop BLT from attempting to prompt if we want to send feedback. (This was noticed in
## our ODE deployment after BLT 12)
blt blt:telemetry:disable --no-interaction

# This variable must be the word true for it to update instead of reinstall
if [[ $PRESERVE_ON_REDEPLOY == "true" ]]; then
  ## Just do a drupal update and update translations
  blt deploy:update --environment=$target_env -v --no-interaction -D drush.ansi=false

  ## Reload translation pack.
  blt cgov:locales:translate --no-interaction -D drush.ansi=false
else
  ## Clear last install out of Memcache.
  ## Drush CR will not work on a non-existant site. Drush CC will not find the memcached
  ## backed bins if the site is not installed. So we made our own to work with empty sites
  ## to clean out memcache. (DB backing stores disappear as soon as the DB is dropped.)
  drush cgov:destroy-cache

  ## Perform a fresh install.
  blt cgov:reinstall --environment=$target_env -v --no-interaction -D drush.ansi=false

  ## Uninstall cgov_yaml_content once done to turn off entity presave hack for supporting
  ## drupal-entity.
  drush pmu cgov_yaml_content
fi

## Make sure Drupal cron jobs (e.g. sitemap) get run at least once.
drush cron
drush cr

set +v
