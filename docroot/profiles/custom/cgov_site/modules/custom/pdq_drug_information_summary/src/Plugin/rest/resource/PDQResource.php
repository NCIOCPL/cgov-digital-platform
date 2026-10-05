<?php

namespace Drupal\pdq_drug_information_summary\Plugin\rest\resource;

use Drupal\rest\Plugin\ResourceBase;
use Symfony\Component\HttpKernel\Exception\GoneHttpException;

/**
 * Provides temporary compatibility for the retired PDQ DIS REST API.
 *
 * This plugin definition must remain available while existing sites still
 * have the rest.resource.pdq_dis_api configuration. Update hook 10001 removes
 * that configuration. This class can be deleted after the update has been
 * deployed to all environments.
 *
 * @RestResource(
 *   id = "pdq_dis_api",
 *   label = @Translation("Retired PDQ Drug Information Summaries API"),
 *   uri_paths = {
 *     "canonical" = "/pdq/api/dis/{id}",
 *     "create" = "/pdq/api/dis"
 *   }
 * )
 */
class PDQResource extends ResourceBase {

  /**
   * Rejects requests to retrieve DIS content through the retired API.
   *
   * @param string $id
   *   A Drupal node ID. Retained for REST route compatibility.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\GoneHttpException
   */
  public function get($id) {
    throw new GoneHttpException('The PDQ DIS REST API has been retired.');
  }

  /**
   * Rejects requests to store DIS content through the retired API.
   *
   * @param array $data
   *   Request data. Retained for REST route compatibility.
   *
   * @throws \Symfony\Component\HttpKernel\Exception\GoneHttpException
   */
  public function post(array $data) {
    throw new GoneHttpException('The PDQ DIS REST API has been retired.');
  }

}
