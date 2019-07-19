#!/bin/bash
# Min migration scripts
#
set -ev

mig_name=$MIGRATION


migrations=(
    summary_migration
    summaryes_migration
    dis_migration
    cgovimage_migration
    cgovimage_es_migration
    externallinksql_migration
    internallinksql_migration
    citation_migration
    medialink_migration
    paragraph_en_migration
    paragraph_es_migration
    appmodulepage_en_migration
    appmodulepage_es_migration
    venue_migration
    eventseries_migration
    event_migration
    campus_migration
    biography_migration
    pressrelease_en_migration
    pressrelease_es_migration
    article_en_migration
    article_es_migration
    video_en_migration
    video_es_migration
    infographic_en_migration
    infographic_es_migration
    region_migration
    cancercentertype_migration
    cancercenter_migration
    promocard_migration
    externalpromocard_migration
    contentblock_migration
    rawhtml_migration
    primaryfeaturecardrow_migration
    secondaryfeaturecardrow_migration
    list_migration
    multimediarow_migration
    dynamiclist_migration
    twocolumnrow_migration
    guidecardrow_migration
    twoitemfeaturecardrow_migration
    blogseries_en_migration
    blogseries_es_migration
    blogtopics_migration
    blogtopics_es_migration
    blogpost_en_migration
    blogpost_es_migration
    minilanding_en_migration
    minilanding_es_migration
    cancerresearch_en_migration
    cancerresearch_es_migration
    cthpcontentblock_migration
    cthpblockcontentcard_migration
    cthpguidecard_migration
    cthpexternalfeaturecard_migration
    cthpfeaturecard_migration
    cthpresearchcard_migration
    cthpvideocard_migration
    cthpoverviewcard_migration
    cthp_en_migration
    cthp_es_migration
    homelanding_en_migration
    homelanding_es_migration
    contextualimage_migration
    contextualimage_es_migration
    file_en_migration
);

mig_updates=(
    update_article_en_migration
    update_article_es_migration
    update_paragraph_en_migration
    update_paragraph_es_migration
    update_pressrelease_en_migration
    update_pressrelease_es_migration
    update_infographic_en_migration
    update_infographic_es_migration
    update_biography_migration
    update_event_migration
    update_cthpcontentblock_migration
    update_contentblock_migration
    update_citation_migration
    update_cancercenter_migration
    update_blogpost_en_migration
    update_blogpost_es_migration
);

case $mig_name in
CGOV | NANO | MYPART | NCICONNECT | DCEG)
  ;;
*)
  echo 'MIGRATION NOT SET'
  ;;
esac

echo "[$(date +%F_%T)] Executing migration to $mig_name"

echo "[$(date +%F_%T)] Starting First Pass"
for mig in "${migrations[@]}"
do
  echo "[$(date +%F_%T)] Executing $mig"
  MIGRATION=$mig_name drush mim $mig
done
echo "[$(date +%F_%T)] First Pass Done"

echo "[$(date +%F_%T)] Starting Updates"
for mig in "${mig_updates[@]}"
do
  echo "[$(date +%F_%T)] Executing $mig"
  MIGRATION=$mig_name drush mim $mig
done
echo "[$(date +%F_%T)] Finished Updates"

drush ms --format=csv
echo "[$(date +%F_%T)] Finished migration to $mig_name"

set +v
