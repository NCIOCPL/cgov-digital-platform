#!/bin/bash
# Min migration scripts
#
set -ev

if [ $MIGRATION = 1 ]; then
    drush mim externallinksql_migration; drush mim internallinksql_migration; drush mim citation_migration
    drush mim paragraph_en_migration; drush mim paragraph_es_migration
    drush mim article_en_migration && drush mim article_es_migration
else
    echo 'MIGRATION NOT SET'
fi

set +v
