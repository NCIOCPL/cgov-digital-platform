<?php

namespace CGovPlatform\Tests;

/**
 * A custom class containing schema exclusions test cases.
 */
class CgovSchemaExclusions {

  /**
   * An array of config object names that are excluded from schema checking.
   *
   * @var string[]
   */
  public static $configSchemaCheckerExclusions = [
    'metatag.metatag_defaults.global',
    'metatag.metatag_defaults.node',
    'metatag.metatag_defaults.media',
    'metatag.metatag_defaults.403',
    'metatag.metatag_defaults.404',
    'metatag.metatag_defaults.node__cgov_application_page',
    'metatag.metatag_defaults.node__cgov_article',
    'metatag.metatag_defaults.node__cgov_biography',
    'metatag.metatag_defaults.node__cgov_blog_post',
    'metatag.metatag_defaults.node__cgov_blog_series',
    'metatag.metatag_defaults.node__cgov_cancer_center',
    'metatag.metatag_defaults.node__cgov_cancer_research',
    'metatag.metatag_defaults.node__cgov_cthp',
    'metatag.metatag_defaults.node__cgov_event',
    'metatag.metatag_defaults.node__cgov_home_landing',
    'metatag.metatag_defaults.node__cgov_mini_landing',
    'metatag.metatag_defaults.media__cgov_infographic',
    'metatag.metatag_defaults.node__cgov_press_release',
    'metatag.metatag_defaults.media__cgov_video',
    'metatag.metatag_defaults.node__cgov_video',
    'metatag.metatag_defaults.node__pdq_cancer_information_summary',
    'metatag.metatag_defaults.node__pdq_drug_information_summary',
    // See https://www.drupal.org/project/adobe_dtm/issues/3117875
    // for the tracked issue.
    'adobe_dtm.settings',
  ];

}
