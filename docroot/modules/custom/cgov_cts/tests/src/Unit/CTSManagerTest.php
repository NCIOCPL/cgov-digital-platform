<?php

namespace Drupal\Tests\cgov_cts\Unit;

use Drupal\Tests\UnitTestCase;
use Drupal\cgov_cts\Services\CTSManager;
use NCIOCPL\ClinicalTrialSearch\Model\ClinicalTrial;
use NCIOCPL\ClinicalTrialSearch\Model\ClinicalTrialsCollection;

/**
 * Tests for the CTSManager.
 */
class CTSManagerTest extends UnitTestCase {

  /**
   * The API client proxy mock.
   *
   * @var \Drupal\cgov_cts\Services\ClinicalTrialsApiProxy|\PHPUnit_Framework_MockObject_MockObject
   */
  protected $proxy;

  /**
   * {@inheritdoc}
   */
  protected function setUp() {
    parent::setUp();

    $this->proxy = $this->getMockBuilder('\Drupal\cgov_cts\Services\ClinicalTrialsApiProxy')
      ->disableOriginalConstructor()
      ->getMock();
  }

  /**
   * {@inheritdoc}
   */
  public function testManager() {
    $manager = new CTSManager($this->proxy);
    $this->assertNotNull($manager, 'Can create new instance of manager class');

  }

  /**
   * {@inheritdoc}
   */
  public function testGetWithNull() {
    $manager = new CTSManager($this->proxy);
    try {
      $manager->get(NULL);
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testGetWithEmpty() {
    $manager = new CTSManager($this->proxy);
    try {
      $manager->get("");
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testGetWithInvalidId() {
    $manager = new CTSManager($this->proxy);

    try {
      $manager->get('chicken');
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testGetWithInvalidNciId() {
    $manager = new CTSManager($this->proxy);

    try {
      $manager->get('NCII-0000-00000');
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testGetWithInvalidNctId() {
    $manager = new CTSManager($this->proxy);

    try {
      $manager->get('NCT0000NCT');
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testGetWithValidNciId() {
    $this->proxy->expects($this->any())
      ->method('getTrialById')
      ->with('NCI-2014-01507')
      ->willReturn(new ClinicalTrial([
        'NCIID' => 'NCI-2014-01507',
        'BriefTitle' => 'Crizotinib in Treating Patients with Stage IB-IIIA Non-small Cell Lung Cancer That Has Been Removed by Surgery and ALK Fusion Mutations (An ALCHEMIST Treatment Trial)',
      ]));

    $manager = new CTSManager($this->proxy);

    $trial = $manager->get('NCI-2014-01507');

    $this->assertNotNull($trial);
    $this->assertSame('NCI-2014-01507', $trial->NCIID, "NCIID is the same.");
  }

  /**
   * {@inheritdoc}
   */
  public function testGetWithValidNctId() {
    $this->proxy->expects($this->any())
      ->method('getTrialById')
      ->with('NCT02201992')
      ->willReturn(new ClinicalTrial([
        'NCTID' => 'NCT02201992',
        'BriefTitle' => 'Crizotinib in Treating Patients with Stage IB-IIIA Non-small Cell Lung Cancer That Has Been Removed by Surgery and ALK Fusion Mutations (An ALCHEMIST Treatment Trial)',
      ]));

    $manager = new CTSManager($this->proxy);

    $trial = $manager->get('NCT02201992');

    $this->assertNotNull($trial);
    $this->assertSame('NCT02201992', $trial->NCTID, "NCTID is the same.");
  }

  /**
   * {@inheritdoc}
   */
  public function testSearchTrialsByPostWithNull() {
    $manager = new CTSManager($this->proxy);

    try {
      $manager->getClinicalTrials(NULL);
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testSearchTrialsByPostWithEmpty() {
    $manager = new CTSManager($this->proxy);

    try {
      $manager->getClinicalTrials("");
    }
    catch (\Exception $e) {
      $this->assertTrue(TRUE);
    }
  }

  /**
   * {@inheritdoc}
   */
  public function testSearchTrialsByPost() {
    $this->proxy->expects($this->any())
      ->method('searchTrialsByPost')
      ->with('{ \"nci_id\": \"NCI-2014-01507\" }')
      ->willReturn(new ClinicalTrial([
        'NCIID' => 'NCI-2014-01507',
        'BriefTitle' => 'Crizotinib in Treating Patients with Stage IB-IIIA Non-small Cell Lung Cancer That Has Been Removed by Surgery and ALK Fusion Mutations (An ALCHEMIST Treatment Trial)',
      ]));

    $manager = new CTSManager($this->proxy);

    $trial = $manager->getClinicalTrials('{ \"nci_id\": \"NCI-2014-01507\" }');

    $this->assertNotNull($trial);
    $this->assertSame('NCI-2014-01507', $trial->NCIID, "NCIID is the same.");
  }

  /**
   * {@inheritdoc}
   */
  public function testSearchTrialsByPostWithMultiple() {
    $this->proxy->expects($this->any())
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

    $manager = new CTSManager($this->proxy);

    $trials = $manager->getClinicalTrials('{ \"nci_id\": [\"NCI-2014-01507\",  \"NCI-2015-01918\" ]}');

    $this->assertNotNull($trials);
    $this->assertSame(2, $trials->TotalResults, "Total Results is the same.");
    $this->assertSame('NCI-2014-01507', $trials->Trials[0]->NCIID, "Trial ID 1 is the same.");
    $this->assertSame('NCI-2015-01918', $trials->Trials[1]->NCIID, "Trial ID 2 is the same.");
  }

}
