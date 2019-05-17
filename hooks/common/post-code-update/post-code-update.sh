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

## Perform a fresh install
blt artifact:install:drupal --environment=$target_env -v --yes --no-interaction
blt cgov:user:load-all -D cgov.drupal_users_file=$users_file
blt cgov:locales:translate

case $MIGRATION in
CGOV)
  blt cgov:install:site-sections --no-interaction   # This (of course) loads the site sections and megamenus.
  ./scripts/utility/cgov_migration_load.sh
  ;;
DCEG)
  blt cgov:install:site-sections --no-interaction   # This (of course) loads the site sections and megamenus.
  ./scripts/utility/cgov_migration_load.sh
  ;;
NANO)
  blt cgov:install:site-sections --no-interaction   # This (of course) loads the site sections and megamenus.
  ./scripts/utility/cgov_migration_load.sh
  ;;
MYPART)
  blt cgov:install:site-sections --no-interaction   # This (of course) loads the site sections and megamenus.
  ./scripts/utility/cgov_migration_load.sh
  ;;
NCICONNECTOR)
  blt cgov:install:site-sections --no-interaction   # This (of course) loads the site sections and megamenus.
  ./scripts/utility/cgov_migration_load.sh
  ;;
*)
  blt custom:install_cgov_yaml_content_by_module cgov_yaml_content
  ;;
esac

set +v
