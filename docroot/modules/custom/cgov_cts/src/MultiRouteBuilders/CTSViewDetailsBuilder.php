<?php

namespace Drupal\cgov_cts\MultiRouteBuilders;

use Symfony\Component\HttpFoundation\RequestStack;
use Drupal\app_module\Plugin\app_module\MultiRouteAppModuleBuilderBase;
use Drupal\Core\Cache\CacheableMetadata;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\cgov_cts\Services\CTSManager;

/**
 * Default route builder for CTS - should just load React app.
 */
class CTSViewDetailsBuilder extends MultiRouteAppModuleBuilderBase {

  /**
   * Symfony\Component\HttpFoundation\RequestStack definition.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  protected $requestStack;

  /**
   * The CTSManager client.
   *
   * @var \Drupal\cgov_cts\Services\CTSManager
   */
  private $ctsManager;

  /**
   * The trial ID.
   *
   * @var string
   */
  private $trialID = '';

  /**
   * Constructs a CTSViewDetailsBuilder object.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request_stack
   *   The request object.
   * @param \Drupal\cgov_cts\Services\CTSManager $ctsManager
   *   A configuration array containing information about the plugin instance.
   */
  public function __construct(RequestStack $request_stack, CTSManager $ctsManager) {
    $this->requestStack = $request_stack;
    $this->ctsManager = $ctsManager;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $requestStack = $container->get('request_stack');
    $ctsManager = $container->get('cgov_cts.cts_manager');

    return new static($requestStack, $ctsManager);
  }

  /**
   * {@inheritdoc}
   */
  public function id() {
    return 'view_details';
  }

  /**
   * {@inheritdoc}
   */
  public function build(array $options) {
    // Get ID from current request's query params.
    $id = $this->requestStack->getCurrentRequest()->query->get('id');

    // Validate ID query param.
    if (preg_match("/^NCT[0-9]+$/", $id) || preg_match("/^NCI-/", $id)) {
      $this->trialID = $id;
    }
    else {
      throw new \Exception("Invalid trial ID.");
    }

    // Get Clinical Trial from ID.
    $trial = $this->ctsManager->get($this->trialID);

    // Set up Inclusion/Exclusion Criteria variables.
    $inclusionCriteria = $this->setupInclusionCriteria($trial);
    $exclusionCriteria = $this->setupExclusionCriteria($trial);

    // Set up study site variables.
    $usaStudySites = $this->setupTrialLocationsUsa($trial);
    $canadaStudySites = $this->setupTrialLocationsCanada($trial);
    $otherStudySites = $this->setupTrialLocationsOther($trial);

    // Set up Trial Objectives & Outline variable.
    $trialObjectives = $this->setupTrialObjectivesAndOutline($trial);

    // Set up Trial Phase variable.
    $trialPhase = $this->setupTrialPhase($trial);

    // Set up Trial Type variable.
    $trialType = $this->setupTrialType($trial);

    // Set up Secondary IDs variable.
    $secondaryIds = $this->setupSecondaryIds($trial);

    $build = [
      '#theme' => 'clinical_trial',
      '#attributes' => [],
      '#trial' => $trial,
      '#inclusion_criteria' => $inclusionCriteria,
      '#exclusion_criteria' => $exclusionCriteria,
      '#usa_study_sites' => $usaStudySites,
      '#canada_study_sites' => $canadaStudySites,
      '#other_study_sites' => $otherStudySites,
      '#trial_objectives' => $trialObjectives,
      '#trial_phase' => $trialPhase,
      '#trial_type' => $trialType,
      '#secondary_ids' => $secondaryIds,
      'content' => [],
    ];

    return $build;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheInfo(array $options) {
    $meta = new CacheableMetadata();
    // TODO: Add protocol ID here.
    $meta
      ->setCacheTags(['cgov_cts_app', $this->trialID]);

    $meta
      ->setCacheContexts(['url.query_args:id']);
    return $meta;
  }

  /**
   * Set up Inclusion Criteria variable.
   */
  protected function setupInclusionCriteria($trial) {
    if ($trial->EligibilityInfo) {
      if ($trial->EligibilityInfo->UnstructuredCriteria && count($trial->EligibilityInfo->UnstructuredCriteria) >= 1) {
        foreach ($trial->EligibilityInfo->UnstructuredCriteria as $criterion) {
          if ($criterion->IsInclusionCriterion) {
            return TRUE;
          }
        }
      }
    }
  }

  /**
   * Set up Exclusion Criteria variable.
   */
  protected function setupExclusionCriteria($trial) {
    if ($trial->EligibilityInfo) {
      if ($trial->EligibilityInfo->UnstructuredCriteria && count($trial->EligibilityInfo->UnstructuredCriteria) >= 1) {
        foreach ($trial->EligibilityInfo->UnstructuredCriteria as $criterion) {
          if (!$criterion->IsInclusionCriterion) {
            return TRUE;
          }
        }
      }
    }
  }

  /**
   * Set up USA study sites variable.
   */
  protected function setupTrialLocationsUsa($trial) {
    if ($trial->Sites && count($trial->Sites) >= 1) {
      $usaSites = [];

      // Pull out all US trial sites.
      foreach ($trial->Sites as $site) {
        if ($site->Country && ($site->Country === 'United States')) {
          $usaSites[] = $site;
        }
      }

      $groupedUSASites = [];

      // Group ites by state.
      foreach ($usaSites as $site) {
        $stateName = $this->getStateProvinceName($site->StateOrProvinceAbbreviation);
        $site->StateOrProvinceAbbreviation = $stateName;
        $groupedUSASites[$site->StateOrProvinceAbbreviation][] = $site;
      }
      // Sort sites by key (state name).
      ksort($groupedUSASites);

      foreach ($groupedUSASites as $state => $cityLocations) {
        $cities = [];
        // Group state sites by city.
        foreach ($cityLocations as $site) {
          $cities[$site->City][] = $site;
        }
        // Sort cities by key (city name).
        ksort($cities);
        // Sort sites within city by name, if more than one site in city.
        foreach ($cities as $city => $locations) {
          if (count($locations) > 1) {
            usort($locations, function ($a, $b) {
              return strcmp($a->Name, $b->Name);
            });
            $cities[$city] = $locations;
          }
        }
        $groupedUSASites[$state] = $cities;
      }
      if (count($groupedUSASites) >= 1) {
        return $groupedUSASites;
      }
    }
  }

  /**
   * Set up Canada study sites variable.
   */
  protected function setupTrialLocationsCanada($trial) {
    if ($trial->Sites && count($trial->Sites) >= 1) {
      $canadaSites = [];

      // Pull out all Canadian trial sites.
      foreach ($trial->Sites as $site) {
        if ($site->Country && ($site->Country === 'Canada')) {
          $canadaSites[] = $site;
        }
      }

      $groupedCanadaSites = [];

      // Group sites by province.
      foreach ($canadaSites as $site) {
        $stateName = $this->getStateProvinceName($site->StateOrProvinceAbbreviation);
        $site->StateOrProvinceAbbreviation = $stateName;
        $groupedCanadaSites[$site->StateOrProvinceAbbreviation][] = $site;
      }
      // Sort sites by key (province name).
      ksort($groupedCanadaSites);

      foreach ($groupedCanadaSites as $province => $cityLocations) {
        $cities = [];
        // Group province sites by city.
        foreach ($cityLocations as $site) {
          $cities[$site->City][] = $site;
        }
        // Sort cities by key (city name).
        ksort($cities);
        // Sort sites within city by name, if more than one site in city.
        foreach ($cities as $city => $locations) {
          if (count($locations) > 1) {
            usort($locations, function ($a, $b) {
              return strcmp($a->Name, $b->Name);
            });
            $cities[$city] = $locations;
          }
        }
        $groupedCanadaSites[$province] = $cities;
      }
      if (count($groupedCanadaSites) >= 1) {
        return $groupedCanadaSites;
      }
    }
  }

  /**
   * Set up other study sites variable.
   */
  protected function setupTrialLocationsOther($trial) {
    if ($trial->Sites && count($trial->Sites) >= 1) {
      $otherSites = [];

      // Pull out all Canadian trial sites.
      foreach ($trial->Sites as $site) {
        if ($site->Country && (($site->Country !== 'United States') && ($site->Country !== 'Canada'))) {
          $otherSites[] = $site;
        }
      }
      /* Set up non-USA/Canada sites. */
      $groupedOtherSites = [];

      // Group international sites by country.
      foreach ($otherSites as $site) {
        $groupedOtherSites[$site->Country][] = $site;
      }
      // Sort international sites by key (country name).
      ksort($groupedOtherSites);

      foreach ($groupedOtherSites as $country => $cityLocations) {
        $cities = [];
        // Group country sites by city.
        foreach ($cityLocations as $site) {
          $cities[$site->City][] = $site;
        }
        // Sort cities by key (city name).
        ksort($cities);
        // Sort sites within city by name, if more than one site in city.
        foreach ($cities as $city => $locations) {
          if (count($locations) > 1) {
            usort($locations, function ($a, $b) {
              return strcmp($a->Name, $b->Name);
            });
            $cities[$city] = $locations;
          }
        }
        $groupedOtherSites[$country] = $cities;
      }
      if (count($groupedOtherSites) >= 1) {
        return $groupedOtherSites;
      }
    }
  }

  /**
   * Set up Trial Objectives & Outline variable.
   */
  protected function setupTrialObjectivesAndOutline($trial) {
    if ($trial->DetailedDescription) {
      $detailedDesc = $trial->DetailedDescription;
      $detailedDescSplit = explode("\r\n", $detailedDesc);
      $detailedDesc = '<p class="ctrp">' . implode('</p><p class="ctrp">', $detailedDescSplit) . '</p>';
      return $detailedDesc;
    }
  }

  /**
   * Set up trial phase variable.
   */
  protected function setupTrialPhase($trial) {
    $phase = NULL;
    if ($trial->TrialPhase) {
      if ($trial->TrialPhase->PhaseNumber) {
        $phase = $trial->TrialPhase->PhaseNumber;
        return 'Phase ' . str_replace('_', '/', $phase);
      }
      else {
        return 'No phase specified';
      }
    }
  }

  /**
   * Set up trial type variable.
   */
  protected function setupTrialType($trial) {
    $trialType = '';
    if ($trial->PrimaryPurpose) {
      if ($trial->PrimaryPurpose->Code) {
        $trialType = $trial->PrimaryPurpose->Code;
        if (strtolower($trialType) === 'other') {
          $trialType = $trial->PrimaryPurpose->OtherText;
        }
      }

      if (!empty($trialType)) {
        $trialType = strtolower($trialType);
        $trialType = ucfirst($trialType);
        $trialType = str_replace('_', ' ', $trialType);
        return $trialType;
      }
    }
  }

  /**
   * Set up secondary IDs variable.
   */
  protected function setupSecondaryIds($trial) {
    $secondaryIds = [
      'NCIID' => $trial->NCIID,
      'CCRID' => $trial->CCRID,
      'DCPID' => $trial->DCPID,
      'CTEPID' => $trial->CTEPID,
    ];

    if ($trial->OtherTrialIDs && count($trial->OtherTrialIDs) >= 1) {
      foreach ($trial->OtherTrialIDs as $id) {
        if (!in_array($id->Value, $secondaryIds)) {
          $secondaryIds[] = $id->Value;
        }
      }
    }

    $secondaryIds = array_filter($secondaryIds);
    foreach ($secondaryIds as $key => $value) {
      if (($value === $trial->ProtocolID) || ($value === $trial->NCTID)) {
        unset($secondaryIds[$key]);
      }
    }

    return implode(', ', $secondaryIds);
  }

  /**
   * Get state name from abbreviation.
   */
  protected function getStateProvinceName($state) {
    switch ($state) {
      case "AB": $state = "Alberta";
        break;

      case "AK": $state = "Alaska";
        break;

      case "AL": $state = "Alabama";
        break;

      case "AR": $state = "Arkansas";
        break;

      case "AS": $state = "American Samoa";

      case "AZ": $state = "Arizona";
        break;

      case "BC": $state = "British Columbia";
        break;

      case "CA": $state = "California";
        break;

      case "CO": $state = "Colorado";
        break;

      case "CT": $state = "Connecticut";
        break;

      case "DC": $state = "District of Columbia";
        break;

      case "DE": $state = "Delaware";
        break;

      case "FL": $state = "Florida";
        break;

      case "GA": $state = "Georgia";
        break;

      case "GU": $state = "Guam";
        break;

      case "HI": $state = "Hawaii";
        break;

      case "IA": $state = "Iowa";
        break;

      case "ID": $state = "Idaho";
        break;

      case "IL": $state = "Illinois";
        break;

      case "IN": $state = "Indiana";
        break;

      case "KS": $state = "Kansas";
        break;

      case "KY": $state = "Kentucky";
        break;

      case "LA": $state = "Louisiana";
        break;

      case "MA": $state = "Massachusetts";
        break;

      case "MB": $state = "Manitoba";
        break;

      case "MD": $state = "Maryland";
        break;

      case "ME": $state = "Maine";
        break;

      case "MI": $state = "Michigan";
        break;

      case "MN": $state = "Minnesota";
        break;

      case "MO": $state = "Missouri";
        break;

      case "MP": $state = "Northern Mariana Islands";
        break;

      case "MS": $state = "Mississippi";
        break;

      case "MT": $state = "Montana";
        break;

      case "NB": $state = "New Brunswick";
        break;

      case "NC": $state = "North Carolina";
        break;

      case "ND": $state = "North Dakota";
        break;

      case "NE": $state = "Nebraska";
        break;

      case "NH": $state = "New Hampshire";
        break;

      case "NJ": $state = "New Jersey";
        break;

      case "NL": $state = "Newfoundland and Labrador";
        break;

      case "NM": $state = "New Mexico";
        break;

      case "NS": $state = "Nova Scotia";
        break;

      case "NV": $state = "Nevada";
        break;

      case "NY": $state = "New York";
        break;

      case "OH": $state = "Ohio";
        break;

      case "OK": $state = "Oklahoma";
        break;

      case "ON": $state = "Ontario";
        break;

      case "OR": $state = "Oregon";
        break;

      case "PA": $state = "Pennsylvania";
        break;

      case "PE": $state = "Prince Edward Island";
        break;

      case "PR": $state = "Puerto Rico";
        break;

      case "QC": $state = "Quebec";
        break;

      case "RI": $state = "Rhode Island";
        break;

      case "SC": $state = "South Carolina";
        break;

      case "SD": $state = "South Dakota";
        break;

      case "SK": $state = "Saskatchewan";
        break;

      case "TN": $state = "Tennessee";
        break;

      case "TX": $state = "Texas";
        break;

      case "UM": $state = "U.S. Minor Outlying Islands";
        break;

      case "UT": $state = "Utah";
        break;

      case "VA": $state = "Virginia";
        break;

      case "VI": $state = "U.S. Virgin Islands";
        break;

      case "VT": $state = "Vermont";
        break;

      case "WA": $state = "Washington";
        break;

      case "WI": $state = "Wisconsin";
        break;

      case "WV": $state = "West Virginia";
        break;

      case "WY": $state = "Wyoming";
        break;
    }
    return $state;
  }

}
