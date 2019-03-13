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

## TODO: need to figure out what to do here if it is a fresh db
## Perform a fresh install.
blt artifact:install:drupal --environment=$target_env -v --yes --no-interaction
blt cgov:user:load-all -D cgov.drupal_users_file=$users_file
blt cgov:locales:translate
blt custom:install_cgov_yaml_content_by_module cgov_yaml_content
blt custom:locales:translate

set +v
