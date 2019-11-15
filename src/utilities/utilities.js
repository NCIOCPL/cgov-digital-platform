import ReactDOM from 'react-dom';
const zip_codes = require('../mocks/zip_codes.json');
let index = 0;

//  Provides utility functions for components in this library.
//
//  All the functions on this class should be defined as static functions so this
//  class acts more like a namespace than a class that you create instances of.
//
//  See each method's documentation for more infomation about what this class
//  provides.
export default class Utilities {
  //  Returns a unique identifier for the supplied component instance.
  //
  //  This method should only be called from `componentDidMount`.
  //
  //  This method attempts to re-use an existing unique ID (e.g. `data-reactid`)
  //  as much as possible.  If no such unique ID exists, it will generate a
  //  UUID to use for the component instance.
  //
  //  @param {React.Component} component The React component to compute a unique
  //                                     identifier for.
  //  @returns {String} A unique identifier for the supplied component.

  static uniqueIdForComponent(component) {
    let node = ReactDOM.findDOMNode(component); // eslint-disable-line react/no-find-dom-node
    if (node) {
      if (node.hasAttribute('data-reactid')) {
        return 'data-reactid-' + node.getAttribute('data-reactid');
      }
    }
    return `component-unique-id-${index++}`;
  }

  /**
   * A higher order function to handle key events. Especially useful in cases where you want multiple keys to
   * trigger the same event. Pass in the callback you want the keypress to trigger and an array
   * of keys (using either reserved keychar strings or the numeric keycode),
   * and get back out a wrapped version of your function to use as an eventListener callback that is
   * set to trigger only in cases where the keypress event is triggered by
   * one of the specified keys.
   *
   * Additional paramaters allow you to control the stopPropagation and preventDefault handling of the browser.
   * @param {Object} options
   * @param {function} [options.fn = () => {}]
   * @param {Array<Number|String>} [options.keys = []]
   * @param {boolean} [options.stopProp = false]
   * @param {boolean} [options.prevDef = false]
   * @return {function} A wrapped version of your function to pass to use as an eventListener callback
   */
  static keyHandler = (options = {}) => e => {
    if (typeof options !== 'object' || options === null) {
      return;
    }

    const {
      fn = () => {},
      keys = ['Enter', ' '],
      stopProp = true,
      prevDef = true,
    } = options;

    if (keys.indexOf(e.key) !== -1) {
      stopProp && e.stopPropagation();
      prevDef && e.preventDefault();
      return fn();
    }
  };
}

export function matchItemToTerm(item, value) {
  return item.term.toLowerCase().indexOf(value.toLowerCase()) !== -1;
}

export function sortItems(a, b, value) {
  const aLower = a.term.toLowerCase();
  const bLower = b.term.toLowerCase();
  const valueLower = value.toLowerCase();
  const queryPosA = aLower.indexOf(valueLower);
  const queryPosB = bLower.indexOf(valueLower);
  if (queryPosA !== queryPosB) {
    return queryPosA - queryPosB;
  }
  return aLower < bLower ? -1 : 1;
}

// Returning undefined ensures Redux will load from initialState if sessionStorage isn't available
export const loadStateFromSessionStorage = appId => {
  try {
    const serializedState = sessionStorage.getItem(appId);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    return undefined;
  }
};

export const saveStatetoSessionStorage = ({ state, appId }) => {
  try {
    const serializedState = JSON.stringify(state);
    sessionStorage.setItem(appId, serializedState);
  } catch (err) {
    // As session storage backup is a bonus feature. We don't want to
    // throw anything major. If we add in a better logging system, this would be
    // good use case for it.
    console.log(err);
  }
};

export const deepSearchObject = (cacheKey, object, result = []) => {
  Object.keys(object).forEach(key => {
    // does the key match what we're looking for?
    if (key === cacheKey) {
      result.push(object[key]);
      return result;
    }
    if (typeof object[key] === 'object' && object[key] !== null) {
      deepSearchObject(cacheKey, object[key], result);
    }
  });
  return result;
};

export const getStateNameFromAbbr = abbrToLookup => {
  const states = {
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DC: 'District of Columbia',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming',
    PR: 'Puerto Rico',
  };
  return states[abbrToLookup];
};

export const convertZipToLatLong = zip => {
  //TODO: replace with zip code lookup service
  return zip_codes[zip];
};

export const buildQueryString = (formStore) => {
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
    resultsPage,
  } = formStore;

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
      searchValues.dt = [...new Set(drugs.map(item => item.codes[0]))];
    }
    if (treatments > 0) {
      searchValues.ti = [...new Set(treatments.map(item => item.codes[0]))];
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
    if (resultsPage > 1){
      searchValues.pn = resultsPage;
    }

    return searchValues;
  }
};

export const formatTrialSearchQuery = form => {
  let filterCriteria = {};

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
    console.log('dd: ' + JSON.stringify(drugAndTrialIds));
    console.log([...new Set(drugAndTrialIds.map(item => item.codes))]);
    if (form.treatments.length > 0) {
      drugAndTrialIds = [...drugAndTrialIds, ...form.treatments];
    }
    console.log('dt: ' + drugAndTrialIds);
    console.log([...new Set(drugAndTrialIds.map(item => item.codes[0]))]);
    filterCriteria['arms.interventions.intervention_code'] = [...new Set(drugAndTrialIds.map(item => item.codes[0]))];
  }

  //Add Age filter
  if (form.age !== '') {
    filterCriteria['eligibility.structured.max_age_in_years_gte'] = form.age;
    filterCriteria['eligibility.structured.min_age_in_years_lte'] = form.age;
  }

  // keywords
  if (form.keywordPhrases !== '') {
    filterCriteria._fulltext = form.keywordPhrases;
  }

  // trialTypes
  let trialTypesChecked = form.trialTypes.filter(item => item.checked);
  //check if any are selected, none being the same as all
  if (trialTypesChecked.length) {
    filterCriteria['primary_purpose.primary_purpose_code'] = [
      ...new Set(trialTypesChecked.map(item => item.value)),
    ];
  }

  // trialPhases
  //need to add overlapping phases to the array before passing it
  let checkedPhases = form.trialPhases.filter(item => item.checked);
  if (checkedPhases.length > 0) {
    let phaseList = [...new Set(checkedPhases.map(item => item.value))];

    if (phaseList.includes('i')) {
      phaseList.push('i_ii');
    }
    if (phaseList.includes('iii')) {
      phaseList.push('ii_iii');
    }
    if (phaseList.includes('ii')) {
      if (!phaseList.includes('i_ii')) {
        phaseList.push('i_ii');
      }
      if (!phaseList.includes('ii_iii')) {
        phaseList.push('ii_iii');
      }
    }
    if (phaseList.length > 0) {
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
    filterCriteria['sites.org_va'] = true;
  }

  // location
  switch (form.location) {
    case 'search-location-nih':
      //NIH has their own postal code, so this means @NIH
      filterCriteria['sites.org_postal_code'] = '20892';
      break;
    case 'search-location-hospital':
      filterCriteria['sites.org_name_fulltext'] = form.hospital.term;
      break;
    case 'search-location-country':
      filterCriteria['sites.org_country'] = form.country;
      filterCriteria['sites.org_city'] = form.city;
      if (form.country === 'United States') {
        filterCriteria['sites.org_state_or_province'] = [...new Set(form.states.map(item => item.abbr))];
      }
      break;
    case 'search-location-zip':
      if (form.zipCoords.lat !== '' && form.zipCoords.lon !== '') {
        filterCriteria['sites.org_coordinates_lat'] = form.zipCoords.lat;
        filterCriteria['sites.org_coordinates_lon'] = form.zipCoords.lon;
        filterCriteria['sites.org_coordinates_dist'] = form.zipRadius + 'mi';
      }
      break;
    default:
  }

  if (form.resultsPage > 0) {
    filterCriteria.from = form.resultsPage * 10;
  }

  // filterCriteria['sites.recruitment_status'] = [
  //   'Active',
  //   'Approved',
  //   'Enrolling by Invitation',
  //   'In Review',
  //   'Temporarily Closed to Accrual',
  //   'Temporarily Closed to Accrual and Intervention',
  // ];

  filterCriteria.current_trial_status = [
    'Active',
    'Approved',
    'Enrolling by Invitation',
    'In Review',
    'Temporarily Closed to Accrual',
    'Temporarily Closed to Accrual and Intervention',
  ];

  filterCriteria.include = [
    'nci_id',
    'brief_title',
    'sites.org_name',
    'sites.org_postal_code',
    'eligibility.structured',
    'current_trial_status',
    'sites.org_va',
    'sites.org_country',
    'sites.org_state_or_province',
    'sites.org_city',
    'sites.org_coordinates',
    'sites.recruitment_status',
    'diseases',
  ];

  return filterCriteria;
};

/**
 * Mock ZIP code to Geolocation service.
 *
 * Responds to requests sent to /service/zip_lookup/ZIP_CODE
 * where ZIP_CODE is the zip code to lookup.
 *
 * The actual path will likely change.
 */
// module.exports = function(app) {
//     app.use(
//         '/service/zip_lookup/:zip_code',
//         function (req, res) {

//             const zip = req.params.zip_code;
//             const loc = zip_codes[zip];

//             if( loc != null ) {
//                 res
//                     .status(200)
//                     .json(loc);
//             }
//             else {
//                 res.sendStatus(404);
//             }

//         }
//     );
// };
