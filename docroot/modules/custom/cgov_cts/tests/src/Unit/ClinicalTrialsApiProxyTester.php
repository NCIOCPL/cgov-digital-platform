<?php

namespace Drupal\Tests\cgov_cts\Unit;

use Drupal\Core\Config\ConfigFactoryInterface;
use Psr\Log\LoggerInterface;
use NCIOCPL\ClinicalTrialSearch\ClinicalTrialsApiInterface;
use Drupal\cgov_cts\Services\ClinicalTrialsApiProxy;

/**
 * Clinical Trials API Proxy Tester.
 */
class ClinicalTrialsApiProxyTester extends ClinicalTrialsApiProxy {

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
   * Constructor for ClinicalTrialsApiProxyTester object.
   *
   * @param \Drupal\Core\Config\ConfigFactoryInterface $config_factory
   *   The config factory.
   * @param \Psr\Log\LoggerInterface $logger
   *   The logger.
   * @param \NCIOCPL\ClinicalTrialSearch\ClinicalTrialsApiInterface $client
   *   The API client.
   */
  public function __construct(
    ConfigFactoryInterface $config_factory,
    LoggerInterface $logger,
    ClinicalTrialsApiInterface $client
  ) {
    parent::__construct($config_factory, $logger);
    $this->client = $client;
  }

}
