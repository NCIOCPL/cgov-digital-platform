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

echo "Running on ${1}.${2}"
##drush @$site.$target_env updatedb --yes
