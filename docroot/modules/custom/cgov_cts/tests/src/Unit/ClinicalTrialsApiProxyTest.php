<?php

namespace Drupal\Tests\cgov_cts\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_cts\Services\ClinicalTrialsApiProxy;
use NCIOCPL\ClinicalTrialSearch\Model\ClinicalTrial;
use NCIOCPL\ClinicalTrialSearch\Model\ClinicalTrialsCollection;

/**
 * Tests for the ClinicalTrialsApiProxy.
 */
class ClinicalTrialsApiProxyTest extends UnitTestCase {

  /**
   * The config factory mock.
   *
   * @var \Drupal\Core\Config\ConfigFactoryInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $configFactory;

  /**
   * The config mock.
   *
   * @var \Drupal\Core\Config\ImmutableConfig|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $config;

  /**
   * The logger mock.
   *
   * @var \Psr\Log\LoggerInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $logger;

  /**
   * The CTS API client mock.
   *
   * @var \NCIOCPL\ClinicalTrialSearch\ClinicalTrialsApiInterface|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $client;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->configFactory = $this->getMock('\Drupal\Core\Config\ConfigFactoryInterface');
    $this->config = $this->getMockBuilder('\Drupal\Core\Config\ImmutableConfig')
      ->disableOriginalConstructor()
      ->getMock();
    $this->logger = $this->getMock('\Psr\Log\LoggerInterface');
    $this->client = $this->getMock('NCIOCPL\ClinicalTrialSearch\ClinicalTrialsApiInterface');
  }

  /**
   * {@inheritdoc}
   */
  protected function setupConfig($hostName) {
    $this->config->expects($this->any())
      ->method('get')
      ->will($this->returnCallback(
          function ($propName) use ($hostName) {
            switch ($propName) {
              case 'host_name':
                if (!empty($hostName)) {
                  return $hostName;
                }
                else {
                  throw new \Exception('Value of property host_name cannot be found.');
                }
              default:
                throw new \Exception('Property name cannot be found.');
            }
          }
      ));

    // Return our config factory mock.
    $this->configFactory->expects($this->any())
      ->method('get')
      ->with('cgov_cts.settings')
      ->willReturn($this->config);
  }

  /**
   * {@inheritdoc}
   */
  public function testProxy() {
    $this->setupConfig('https://clinicaltrialsapi.cancer.gov');
    $proxy = new ClinicalTrialsApiProxy($this->configFactory, $this->logger);
    $this->assertNotNull($proxy, 'Can create new instance of proxy class');
  }

  /**
   * {@inheritdoc}
   */
  public function testProxyWithNullConfig() {
    $this->setupConfig(NULL);
    try {
      new ClinicalTrialsApiProxy($this->configFactory, $this->logger);
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testProxyWithEmptyConfig() {
    $this->setupConfig("");
    try {
      new ClinicalTrialsApiProxy($this->configFactory, $this->logger);
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testGetTrialByIdWithNull() {
    $this->setupConfig('https://clinicaltrialsapi.cancer.gov');
    $this->client->expects($this->any())
      ->method('getTrialById')
      ->with(NULL)
      ->willThrowException(new \Exception());

    $proxy = new ClinicalTrialsApiProxyTester($this->configFactory, $this->logger, $this->client);
    try {
      $proxy->getTrialById(NULL);
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testGetTrialByIdWithInvalid() {
    $this->setupConfig('https://clinicaltrialsapi.cancer.gov');
    $this->client->expects($this->any())
      ->method('getTrialById')
      ->with('NCI-2014-01507')
      ->willReturn(new ClinicalTrial([
        'NCIID' => 'NCI-2014-01507',
        'BriefTitle' => 'Crizotinib in Treating Patients with Stage IB-IIIA Non-small Cell Lung Cancer That Has Been Removed by Surgery and ALK Fusion Mutations (An ALCHEMIST Treatment Trial)',
      ]));

    $proxy = new ClinicalTrialsApiProxyTester($this->configFactory, $this->logger, $this->client);

    try {
      $proxy->getTrialById('NCI-0000-00000');
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testGetTrialById() {
    $this->setupConfig('https://clinicaltrialsapi.cancer.gov');
    $this->client->expects($this->any())
      ->method('getTrialById')
      ->with('NCI-2014-01507')
      ->willReturn(new ClinicalTrial([
        'NCIID' => 'NCI-2014-01507',
        'BriefTitle' => 'Crizotinib in Treating Patients with Stage IB-IIIA Non-small Cell Lung Cancer That Has Been Removed by Surgery and ALK Fusion Mutations (An ALCHEMIST Treatment Trial)',
      ]));

    $proxy = new ClinicalTrialsApiProxyTester($this->configFactory, $this->logger, $this->client);

    $trial = $proxy->getTrialById('NCI-2014-01507');

    $this->assertNotNull($trial);
    $this->assertSame('NCI-2014-01507', $trial->NCIID, "NCIID is the same.");
  }

  /**
   * {@inheritdoc}
   */
  public function testSearchTrialsByGet() {
    $this->setupConfig('https://clinicaltrialsapi.cancer.gov');
    $this->client->expects($this->any())
      ->method('searchTrialsByGet')
      ->willThrowException(new \Exception());

    $proxy = new ClinicalTrialsApiProxyTester($this->configFactory, $this->logger, $this->client);
    try {
      $proxy->searchTrialsByGet(NULL);
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testSearchTrialsByPostWithNull() {
    $this->setupConfig('https://clinicaltrialsapi.cancer.gov');
    $this->client->expects($this->any())
      ->method('searchTrialsByPost')
      ->with(NULL)
      ->willThrowException(new \Exception());

    $proxy = new ClinicalTrialsApiProxyTester($this->configFactory, $this->logger, $this->client);
    try {
      $proxy->searchTrialsByPost(NULL);
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testSearchTrialsByPost() {
    $this->setupConfig('https://clinicaltrialsapi.cancer.gov');
    $this->client->expects($this->any())
      ->method('searchTrialsByPost')
      ->with('{ \"nci_id\": \"NCI-2014-01507\" }')
      ->willReturn(new ClinicalTrial([
        'NCIID' => 'NCI-2014-01507',
        'BriefTitle' => 'Crizotinib in Treating Patients with Stage IB-IIIA Non-small Cell Lung Cancer That Has Been Removed by Surgery and ALK Fusion Mutations (An ALCHEMIST Treatment Trial)',
      ]));

    $proxy = new ClinicalTrialsApiProxyTester($this->configFactory, $this->logger, $this->client);

    $trial = $proxy->searchTrialsByPost('{ \"nci_id\": \"NCI-2014-01507\" }');

    $this->assertNotNull($trial);
    $this->assertSame('NCI-2014-01507', $trial->NCIID, "NCIID is the same.");
  }

  /**
   * {@inheritdoc}
   */
  public function testSearchTrialsByPostWithMultiple() {
    $this->setupConfig('https://clinicaltrialsapi.cancer.gov');
    $this->client->expects($this->any())
      ->method('searchTrialsByPost')
      ->with('{ \"nci_id\": [\"NCI-2014-01507\",  \"NCI-2015-01918\" ]}')
      ->willReturn(new ClinicalTrialsCollection([
        'TotalResults' => 2,
        'Trials' => [
          new ClinicalTrial([
            'NCIID' => 'NCI-2014-01507',
            'BriefTitle' => 'Crizotinib in Treating Patients with Stage IB-IIIA Non-small Cell Lung Cancer That Has Been Removed by Surgery and ALK Fusion Mutations (An ALCHEMIST Treatment Trial)',
          ]),
          new ClinicalTrial([
            'NCIID' => 'NCI-2015-01918',
            'BriefTitle' => 'Weight Loss Interventions in Treating Overweight and Obese Women with a Higher Risk for Breast Cancer Recurrence',
          ]),
        ],
      ]));

    $proxy = new ClinicalTrialsApiProxyTester($this->configFactory, $this->logger, $this->client);

    $trials = $proxy->searchTrialsByPost('{ \"nci_id\": [\"NCI-2014-01507\",  \"NCI-2015-01918\" ]}');

    $this->assertNotNull($trials);
    $this->assertSame(2, $trials->TotalResults, "Total Results is the same.");
    $this->assertSame('NCI-2014-01507', $trials->Trials[0]->NCIID, "Trial ID 1 is the same.");
    $this->assertSame('NCI-2015-01918', $trials->Trials[1]->NCIID, "Trial ID 2 is the same.");
  }

}
