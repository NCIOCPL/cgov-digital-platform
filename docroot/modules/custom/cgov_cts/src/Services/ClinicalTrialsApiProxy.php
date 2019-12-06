<?php

namespace Drupal\cgov_cts\Services;

use Drupal\Core\Config\ConfigFactoryInterface;
use Psr\Log\LoggerInterface;
use NCIOCPL\ClinicalTrialSearch\ClinicalTrialsApiInterface;
use NCIOCPL\ClinicalTrialSearch\ClinicalTrialsApi;
use NCIOCPL\ClinicalTrialSearch\SwaggerGenerated\Configuration;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Clinical Trials API Proxy.
 */
class ClinicalTrialsApiProxy implements ClinicalTrialsApiInterface {

  /**
   * The config factory.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface
   */
  protected $configFactory;

  /**
   * The logger.
   *
   * @var \Psr\Log\LoggerInterface
   */
  protected $logger;

  /**
   * The CTS API client.
   *
   * @var NCIOCPL\ClinicalTrialSearch\ClinicalTrialsApiInterface
   */
  protected $client;

  /**
   * Constructor for ClinicalTrialsApiProxy object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Psr\Log\LoggerInterface $logger
   *   The logger.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    LoggerInterface $logger
  ) {
    $this->configFactory = $config_factory;
    $this->logger = $logger;

    $ctsConfig = $this->configFactory->get('cgov_cts.settings');
    $hostName = $ctsConfig->get('host_name');

    try {
      $config = new Configuration();
      $config->setHost($hostName);

      $this->client = new ClinicalTrialsAPI(NULL, $config);
    }
    catch (\Exception $e) {
      $this->logger->error($e->getMessage());
    }
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('config.factory'),
      $container->get('logger.factory')->get('cts_api_proxy')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function getTrialById($id) {
    $clinical_trial = $this->client->getTrialById($id);
    return $clinical_trial;
  }

  /**
   * {@inheritdoc}
   */
  public function searchTrialsByGet($size = NULL, $from = NULL, $include = NULL, $exclude = NULL, $_fulltext = NULL, $sites_org_name_fulltext = NULL, $_trialids = NULL, $nci_id = NULL, $nct_id = NULL, $protocol_id = NULL, $ccr_id = NULL, $ctep_id = NULL, $dcp_id = NULL, $current_trial_status = NULL, $phase_phase = NULL, $study_protocol_type = NULL, $brief_title = NULL, $brief_summary = NULL, $official_title = NULL, $primary_purpose_primary_purpose_code = NULL, $accepts_healthy_volunteers_indicator = NULL, $acronym = NULL, $amendment_date = NULL, $anatomic_sites = NULL, $arms_arm_description = NULL, $arms_arm_name = NULL, $arms_arm_type = NULL, $arms_interventions_intervention_code = NULL, $arms_interventions_intervention_description = NULL, $arms_interventions_intervention_name = NULL, $arms_interventions_intervention_type = NULL, $arms_interventions_synonyms = NULL, $associated_studies_study_id = NULL, $associated_studies_study_id_type = NULL, $eligibility_structured_gender = NULL, $eligibility_structured_max_age_in_years_lte = NULL, $eligibility_structured_max_age_in_years_gte = NULL, $eligibility_structured_min_age_in_years_lte = NULL, $eligibility_structured_min_age_in_years_gte = NULL, $eligibility_structured_min_age_unit = NULL, $eligibility_structured_max_age_unit = NULL, $eligibility_structured_max_age_number_lte = NULL, $eligibility_structured_max_age_number_gte = NULL, $eligibility_structured_min_age_number_lte = NULL, $eligibility_structured_min_age_number_gte = NULL, $current_trial_status_date_lte = NULL, $current_trial_status_date_gte = NULL, $record_verification_date_lte = NULL, $record_verification_date_gte = NULL, $sites_org_coordinates_lat = NULL, $sites_org_coordinates_lon = NULL, $sites_org_coordinates_dist = NULL, $sites_contact_email = NULL, $sites_contact_name = NULL, $sites_contact_name__auto = NULL, $sites_contact_name__raw = NULL, $sites_contact_phone = NULL, $sites_generic_contact = NULL, $sites_org_address_line_1 = NULL, $sites_org_address_line_2 = NULL, $sites_org_city = NULL, $sites_org_postal_code = NULL, $sites_org_state_or_province = NULL, $sites_org_country = NULL, $sites_org_country__raw = NULL, $sites_org_email = NULL, $sites_org_family = NULL, $sites_org_fax = NULL, $sites_org_name = NULL, $sites_org_name__auto = NULL, $sites_org_name__raw = NULL, $sites_org_phone = NULL, $sites_org_status = NULL, $sites_org_status_date = NULL, $sites_org_to_family_relationship = NULL, $sites_org_tty = NULL, $sites_recruitment_status = NULL, $sites_recruitment_status_date = NULL) {
    throw new \Exception('searchTrialsByGet is not implemented in the CTS API Proxy Service.');
  }

  /**
   * {@inheritdoc}
   */
  public function searchTrialsByPost($searchDocument) {
    $clinical_trials = $this->client->searchTrialsByPost($searchDocument);
    return $clinical_trials;
  }

}
