#!/bin/sh
#
# Cloud Hook: site-install
#
# Run drush si in the target environment. This script works as
# any Cloud hook.
#
# This is for initial development of our profile. At a certain point,
# there should be an import of example web site content.

# Map the script inputs to convenient names.
site="$1"
target_env="$2"
source_branch="$3"
deployed_tag="$4"
repo_url="$5"
repo_type="$6"

blt setup:drupal:install --environment=$target_env -v --yes --no-interaction

