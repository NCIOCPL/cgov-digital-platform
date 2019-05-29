#!/bin/bash
# Min migration scripts
#
set -ev



case $MIGRATION in
CGOV)
    drush mim summary_migration && drush mim summaryes_migration && drush mim dis_migration
    drush mim externallinksql_migration; drush mim internallinksql_migration; drush mim citation_migration; drush mim medialink_migration
    drush mim paragraph_en_migration; drush mim paragraph_es_migration
    drush mim cgovimage_migration && drush mim cgovimage_es_migration
    drush mim pressrelease_en_migration && drush mim pressrelease_es_migration
    drush mim article_en_migration && drush mim article_es_migration
    drush mim video_en_migration && drush mim video_es_migration
    drush mim infographic_en_migration && drush mim infographic_es_migration

    drush mim region_migration && drush mim cancercentertype_migration && drush mim cancercenter_migration

    drush mim promocard_migration; drush mim externalpromocard_migration
    drush mim contentblock_migration; drush mim rawhtml_migration

    drush mim primaryfeaturecardrow_migration && drush mim secondaryfeaturecardrow_migration && drush mim list_migration && drush mim multimediarow_migration
    drush mim dynamiclist_migration

    drush mim twocolumnrow_migration && drush mim guidecardrow_migration

    drush mim twoitemfeaturecardrow_migration

    drush mim blogseries_en_migration && drush mim blogseries_es_migration && drush mim blogtopics_migration && drush mim blogtopics_es_migration
    drush mim blogpost_en_migration && drush mim blogpost_es_migration

    drush mim minilanding_en_migration && drush mim minilanding_es_migration

    drush mim cancerresearch_en_migration && drush mim cancerresearch_es_migration

    drush mim cthpcontentblock_migration
    drush mim cthpblockcontentcard_migration
    drush mim cthpguidecard_migration
    drush mim cthpexternalfeaturecard_migration
    drush mim cthpfeaturecard_migration
    drush mim cthpresearchcard_migration
    drush mim cthpvideocard_migration
    drush mim cthpoverviewcard_migration
    drush mim cthp_en_migration && drush mim cthp_es_migration

    drush mim homelanding_en_migration && drush mim homelanding_es_migration
    drush mim contextualimage_migration && drush mim contextualimage_es_migration
    drush mim file_en_migration
  ;;
DCEG)
    drush mim externallinksql_migration; drush mim internallinksql_migration; drush mim citation_migration
    drush mim paragraph_en_migration
    drush mim cgovimage_migration
    drush mim article_en_migration
    drush mim video_en_migration

    drush mim contextualimage_migration && drush mim contextualimage_es_migration
    drush mim file_en_migration

  ;;
NANO)
    drush mim externallinksql_migration; drush mim internallinksql_migration; drush mim citation_migration
    drush mim paragraph_en_migration
    drush mim cgovimage_migration
    drush mim article_en_migration

  ;;
MYPART)
    drush mim externallinksql_migration; drush mim internallinksql_migration; drush mim citation_migration
    drush mim paragraph_en_migration
    drush mim cgovimage_migration
    drush mim article_en_migration
    drush mim infographic_en_migration
    drush mim video_en_migration
    drush mim contentblock_migration
    drush mim promocard_migration
    drush mim list_migration
    drush mim multimediarow_migration
    drush mim primaryfeaturecardrow_migration
    drush mim twoitemfeaturecardrow_migration
    drush mim minilanding_en_migration
    drush mim homelanding_en_migration

    drush mim contextualimage_es_migration

    ;;
NCICONNECTOR)
  echo 'nciconnector'
  ;;
*)
  echo 'MIGRATION NOT SET'
  ;;
esac


set +v
