#!/bin/bash
#
# Cloud Hook: post-code-update
#
# The post-code-update hook runs in response to code commits. When you
# push commits to a Git branch, the post-code-update hooks runs for
# each environment that is currently running that branch.
#
# The arguments for post-code-update are the same as for post-code-deploy,
# with the source-branch and deployed-tag arguments both set to the name of
# the environment receiving the new code.
#
# post-code-update only runs if your site is using a Git repository. It does
# not support SVN.

set -ev

## If this is ACSF then exit.
if [[ $AH_SITE_GROUP == "ncigov" ]]; then
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

users_file="$HOME/cgov-drupal-users.yml"

## If this is an ODE we would like things like toggle:modules to work. So we will
## pass in the target env as 'ode'. Then in blt.yml we can have an "ode" environment.
if [[ $target_env =~ ^ode\d* ]]; then
  target_env="ode";
fi

# This variable must be the word true for it to update instead of reinstall
if [[ $PRESERVE_ON_REDEPLOY == "true" ]]; then
  ## Just do a drupal update and update translations
  blt deploy:update --environment=$target_env -v --no-interaction -D drush.ansi=false

  ## Reload translation pack.
  blt cgov:locales:translate -D drush.ansi=false

  ## Setup some default JS globals.
  cat FrontendGlobals.json | drush config:set cgov_core.frontend_globals config_object -
else
  ## Clear last install out of Memcache.
  ## Drush CR will not work on a non-existant site. Drush CC will not find the memcached
  ## backed bins if the site is not installed. So we made our own to work with empty sites
  ## to clean out memcache. (DB backing stores disappear as soon as the DB is dropped.)
  drush cgov:destroy-cache

  ## Perform a fresh install.
  blt artifact:install:drupal --environment=$target_env -v --no-interaction -D drush.ansi=false

  ## Load our test users.
  blt cgov:user:load-all -D cgov.drupal_users_file=$users_file -D drush.ansi=false

  ## Reload translation pack.
  blt cgov:locales:translate -D drush.ansi=false

  ## Setup some default JS globals.
  cat FrontendGlobals.json | drush config:set cgov_core.frontend_globals config_object -

  ## Execute a migration.
  case $MIGRATION in
  CGOV)
    blt cgov:install:site-sections --no-interaction -D drush.ansi=false  # This (of course) loads the site sections and megamenus.
    ./scripts/utility/cgov_migration_load.sh
    ;;
  DCEG)
    blt cgov:install:site-sections --no-interaction -D drush.ansi=false   # This (of course) loads the site sections and megamenus.
    ./scripts/utility/cgov_migration_load.sh
    ;;
  NANO)
    blt cgov:install:site-sections --no-interaction -D drush.ansi=false   # This (of course) loads the site sections and megamenus.
    ./scripts/utility/cgov_migration_load.sh
    ;;
  MYPART)
    blt cgov:install:site-sections --no-interaction -D drush.ansi=false   # This (of course) loads the site sections and megamenus.
    ./scripts/utility/cgov_migration_load.sh
    ;;
  NCICONNECT)
    blt cgov:install:site-sections --no-interaction   # This (of course) loads the site sections and megamenus.
    ./scripts/utility/cgov_migration_load.sh
    ;;
  *)
    blt custom:install_cgov_yaml_content_by_module cgov_yaml_content -D drush.ansi=false
    ## Uninstall cgov_yaml_content once done to turn off entity presave hack for supporting
    ## drupal-entity.
    drush pmu cgov_yaml_content
    ;;
  esac
fi

set +v
