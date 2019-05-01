#!/bin/bash
# Min migration scripts
#
set -ev

if [ $MIGRATION = 1 ]; then
    drush mim summary_migration && drush mim summaryes_migration && drush mim dis_migration
    drush mim externallinksql_migration; drush mim internallinksql_migration; drush mim citation_migration
    drush mim paragraph_en_migration; drush mim paragraph_es_migration
    drush mim cgovimage_migration && drush mim cgovimage_es_migration
    drush mim article_en_migration && drush mim article_es_migration
else
    echo 'MIGRATION NOT SET'
fi

set +v
