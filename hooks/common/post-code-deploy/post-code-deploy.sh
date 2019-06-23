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

## Clear Drupal Cache to get around Memcache issues? (A CR before an install does
## not throw errors. BUt without an install is unsuccessful.) (Possibly because
## the cached items are not longer installed in the database that gets dropped
## before the installation.)
blt cgov:cache-rebuild --environment=$target_env -v --yes --no-interaction -D drush.ansi=false

## Perform a fresh install.
blt artifact:install:drupal --environment=$target_env -v --yes --no-interaction -D drush.ansi=false

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
  ;;
esac
set +v
