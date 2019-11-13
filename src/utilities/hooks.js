import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { deepSearchObject } from './utilities';
import { queryString } from 'query-string';

// Hooks to share common logic between multiple components

export const useCachedValues = cacheKeys => {
  const [currentVals, setCurrentVals] = useState({
    ...cacheKeys.map(key => ({ [key]: [] })),
  });
  const cache = useSelector(store => store.cache);
  useEffect(() => {
    const newVals = Object.assign(
      {},
      ...cacheKeys.map(key => {
        const result = deepSearchObject(key, cache);
        return { [key]: result[0] || [] };
      })
    );
    setCurrentVals(newVals);
  }, [cache]);
  return currentVals;
};

export const useChipList = (chiplistName, handleUpdate) => {
  const list = useSelector(store => store.form[chiplistName]);
  const [chips, setChips] = useState([]);
  useEffect(() => {
    handleUpdate(chiplistName, [...chips]);
  }, [chips, chiplistName, handleUpdate]);
  const add = item => {
    //prevent dupes
    const newChips = [...chips, { label: item }];
    setChips([...new Set(newChips)]);
  };
  const remove = item => {
    let newChips = chips.filter(value => {
      return value.label !== item;
    });
    setChips([...newChips]);
  };

  return {
    list,
    add,
    remove,
  };
};

// showing and hiding a react modal component
export const useModal = () => {
  const [isShowing, setIsShowing] = useState(false);

  function toggleModal() {
    setIsShowing(!isShowing);

    if (!isShowing) {
      document.getElementById('main-content').classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
  }

  return {
    isShowing,
    toggleModal,
  };
};

export const useQueryString = () => {
  const {
    formType,
    age,
    keywordPhrases,
    zip,
    zipRadius,
    cancerType,
    subtypes,
    stages,
    findings,
    country,
    location,
    city,
    states,
    hospital,
    healthyVolunteers,
    nihOnly,
    vaOnly,
    trialPhases,
    trialTypes,
    drugs,
    treatments,
    trialId,
    investigator,
    leadOrg,
  } = useSelector(store => store.form);

  let searchValues = {};

  if (cancerType.codes.length > 0) {
    searchValues.t = cancerType.codes[0];
  }
  if (age !== '') {
    searchValues.a = age;
  }
  if (keywordPhrases !== '') {
    searchValues.q = keywordPhrases;
  }
  if (zip !== '') {
    searchValues.z = zip;
  }

  if (formType === 'basic') {
    // form type param
    searchValues.rl = 1;
    return searchValues;
  } else {
    searchValues.rl = 2;

    if (subtypes.length > 0) {
      searchValues.st = [...new Set(subtypes.map(item => item.codes[0]))];
    }
    if (stages.length > 0) {
      searchValues.stg = [...new Set(stages.map(item => item.codes[0]))];
    }
    if (findings.length > 0) {
      searchValues.fin = [...new Set(findings.map(item => item.codes[0]))];
    }
    if (nihOnly) {
      searchValues.nih = 1;
    }
    if (vaOnly) {
      searchValues.va = 1;
    }
    switch (location) {
      case 'search-location-zip':
        searchValues.loc = 1;
        searchValues.z = zip;
        searchValues.zp = zipRadius;
        break;
      case 'search-location-country':
        searchValues.loc = 2;
        searchValues.lcnty = country;
        searchValues.lcty = hospital.term;
        if (country === 'United States') {
          searchValues.lst = [...new Set(states.map(item => item.abbr))];
        }
        break;
      case 'search-location-hospital':
        searchValues.loc = 3;
        searchValues.hos = hospital.term;
        break;
      case 'search-location-nih':
        searchValues.loc = 4;
        break;
      case 'search-location-all':
      default:
        searchValues.loc = 0;
    }

    let types = trialTypes.filter(item => item.checked);
    if (types.length > 0) {
      searchValues.tt = [...new Set(types.map(item => item.value))];
    }

    let phases = trialPhases.filter(item => item.checked);
    if (phases.length > 0) {
      searchValues.tp = [...new Set(phases.map(item => item.value))];
    }

    if (country !== 'United States') {
      searchValues.lcty = city;
    }
    if (states.length > 0) {
      searchValues.lst = [...new Set(states.map(item => item.abbr))];
    }
    if (city !== '') {
      searchValues.lcty = city;
    }
    if (healthyVolunteers) {
      searchValues.hv = 1;
    }

    if (drugs.length > 0) {
      searchValues.dt = [...new Set(drugs.map(item => item.code))];
    }
    if (treatments > 0) {
      searchValues.ti = [...new Set(treatments.map(item => item.code))];
    }
    if (trialId !== '') {
      searchValues.tid = trialId;
    }
    if (investigator.term !== '') {
      searchValues.in = investigator.term;
    }
    if (leadOrg.term !== '') {
      searchValues.lo = leadOrg.term;
    }
    return searchValues;
  }
};

// wcms-cde/CDESites/CancerGov/SiteSpecific/Modules/CancerGov.BasicCTSv2/SearchParams/CTSSearchParamToQueryExtensions.cs
export const useTrialSearchQueryFormatter = () => {
  let filterCriteria = {};
  const form = useSelector(store => store.form);

  //diseases
  if (form.cancerType.codes.length > 0) {
    filterCriteria._maintypes = form.cancerType.codes[0];
  }

  if (form.subtypes.codes && form.subtypes.codes.length > 0) {
    filterCriteria._subtypes = form.subtypes.codes;
  }

  if (form.stages.codes && form.stages.codes.length > 0) {
    filterCriteria._stages = form.stages.codes;
  }

  if (form.findings.codes && form.findings.codes.length > 0) {
    filterCriteria._findings = form.findings;
  }

  //Drugs and Treatments
  if (form.drugs.length > 0 || form.treatments.length > 0) {
    let drugAndTrialIds = [];
    if (form.drugs.length > 0) {
      drugAndTrialIds = [...form.drugs];
    }
    if (form.treatments.length > 0) {
      drugAndTrialIds = [drugAndTrialIds, ...form.drugs];
    }
    filterCriteria.arms.interventions.intervention_code = drugAndTrialIds;
  }

  //Add Age filter
  if (form.age !== '') {
    filterCriteria.eligibility.structured.max_age_in_years_gte = form.age;
    filterCriteria.eligibility.structured.min_age_in_years_lte = form.age;
  }

  // keywords
  if (form.keywords !== '') {
    filterCriteria._fulltext = form.keywords;
  }

  // trialTypes
  let trialTypesChecked = form.trialTypes.filter(item => item.checked);
  //check if any are selected, none being the same as all
  if (trialTypesChecked.length) {
    filterCriteria.primary_purpose.primary_purpose_code = [
      ...new Set(trialTypesChecked.map(item => item.value)),
    ];
  }

  // trialPhases
  //need to add overlapping phases to the array before passing it
  let checkedPhases = form.trialPhases.filter(item => item.checked);
  if(checkedPhases.length > 0){
    let phaseList = [
      ...new Set(checkedPhases.map(item => item.value)),
    ]; 
  
    if(phaseList.includes('i')){
      phaseList.push('i_ii');
    }
    if(phaseList.includes('iii')){
      phaseList.push('ii_iii');
    }
    if(phaseList.includes('ii')){
      if(!phaseList.includes('i_ii')){
        phaseList.push('i_ii');
      }
      if(!phaseList.includes('ii_iii')){
        phaseList.push('ii_iii');
      }
    }
    if(phaseList.length > 0){
      filterCriteria['phase.phase'] = phaseList;
    }
  }

  // investigator
  if (form.investigator.term !== '') {
    filterCriteria.principal_investigator_fulltext = form.investigator.term;
  }

  // leadOrg
  if (form.leadOrg.term !== '') {
    filterCriteria.lead_org_fulltext = form.leadOrg.term;
  }

  // add healthy volunteers filter
  if (form.healthyVolunteers) {
    filterCriteria.accepts_healthy_volunteers_indicator = 'YES';
  }

  //trial ids
  if (form.trialId !== '') {
    filterCriteria._trialids = form.trialId;
  }

  // VA only
  if (form.vaOnly) {
    filterCriteria.sites.org_va = true;
  }

  // location
  switch (form.location) {
    case 'search-location-nih':
      //NIH has their own postal code, so this means @NIH
      filterCriteria.sites.org_postal_code = '20892';
      break;
    case 'search-location-hospital':
      filterCriteria.sites.org_name_fulltext = form.hospital.term;
      break;
    case 'search-location-country':
      filterCriteria.sites.org_country = form.country;
      filterCriteria.sites.org_city = form.city;
      if (form.country === 'United States') {
        filterCriteria.sites.org_state_or_province = form.states;
      }
      break;
    case 'search-location-zip':
      if (form.zipCoords.lat !== '' && form.zipCoords.lon !== '') {
        filterCriteria.sites.org_coordinates_lat = form.zipCoords.lat;
        filterCriteria.sites.org_coordinates_lon = form.zipCoords.lon;
        filterCriteria.sites.org_coordinates_dist = form.zipRadius + 'mi';
      }
      break;
    default:
  }

  filterCriteria.current_trial_status = [
    'Active',
    'Approved',
    'Enrolling by Invitation',
    'In Review',
    'Temporarily Closed to Accrual',
    'Temporarily Closed to Accrual and Intervention'
  ];

  filterCriteria.include = [
    'nci_id',
    'brief_title',
    'current_trial_status',
    'eligibility.structured',
    'sites.org_coordinates'
  ];

  return filterCriteria;
};
