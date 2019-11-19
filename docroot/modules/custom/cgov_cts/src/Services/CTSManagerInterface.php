<?php

namespace Drupal\cgov_cts\Services;

/**
 * Methods for retrieving a clinical trial or collection of clinical trials.
 */
interface CTSManagerInterface {

  /**
   * Get a clinical trial by ID.
   *
   * @param string $id
   *   The NCIID or NCTID of the trial to search for.
   *
   * @return NCIOCPL\ClinicalTrialSearch\Model\ClinicalTrial
   *   The retrieved clinical trial.
   */
  public function get($id);

  /**
   * Get a collection of clinical trials based on a query.
   *
   * @param string $searchDocument
   *   A JSON document containing search criteria. Property names may match
   *    any of the parameters specified for searchTrialsByGet().
   *
   * @return NCIOCPL\ClinicalTrialSearch\Model\ClinicalTrialsCollection
   *   The retrieved collection of clinical trials.
   */
  public function getClinicalTrials($searchDocument);

  /**
   * Get a collection of clinical trials based on IDs.
   *
   * @param string $ids
   *   The list of clinical trial IDs to search for.
   * @param int $batchVal
   *   The number of clinical trials to fetch at a time.
   *
   * @return NCIOCPL\ClinicalTrialSearch\Model\ClinicalTrialsCollection
   *   The retrieved collection of clinical trials.
   */
  public function getMultipleTrials($ids, $batchVal);

}
