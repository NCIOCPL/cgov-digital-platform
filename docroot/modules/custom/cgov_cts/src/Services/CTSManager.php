<?php

namespace Drupal\cgov_cts\Services;

/**
 * Methods for retrieving a clinical trial or collection of clinical trials.
 */
class CTSManager implements CTSManagerInterface {

  /**
   * The CTS API client.
   *
   * @var Drupal\cgov_cts\Services\ClinicalTrialsApiProxy
   */
  protected $proxy;

  /**
   * Constructor for CTSManager object.
   *
   * @param Drupal\cgov_cts\Services\ClinicalTrialsApiProxy $proxy
   *   The API client proxy.
   */
  public function __construct(
    ClinicalTrialsApiProxy $proxy
  ) {
    $this->proxy = $proxy;
  }

  /**
   * {@inheritdoc}
   */
  public function get($id) {
    if (empty($id)) {
      throw new \Exception("Trial ID cannot be null or empty.");
    }
    if (!preg_match("/^NCT[0-9]+$/", $id) && !preg_match("/^NCI-/", $id)) {
      throw new \Exception("Invalid trial ID.");
    }

    $clinical_trial = $this->proxy->getTrialById($id);
    // RemoveNonRecruitingSites($clinical_trial);
    return $clinical_trial;
  }

  /**
   * {@inheritdoc}
   */
  public function getClinicalTrials($searchDocument) {
    if (empty($searchDocument)) {
      throw new \Exception("Search document cannot be null or empty.");
    }

    $clinical_trials = $this->proxy->searchTrialsByPost($searchDocument);
    return $clinical_trials;
  }

  /**
   * {@inheritdoc}
   */
  public function getMultipleTrials($ids, $batchVal) {
    throw new \Exception('getMultipleTrials is not implemented in the CTS Manager Service.');
  }

}
