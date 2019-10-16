// import querystring from 'query-string';
import { UPDATE_FORM, CLEAR_FORM, RECEIVE_DATA } from './identifiers';


//Statuses of what Cancer.gov trials should be shown
const VIEWABLE_TRIALS = [
  'Active',
  'Approved',
  'Enrolling by Invitation',
  'In Review',
  'Temporarily Closed to Accrual',
  'Temporarily Closed to Accrual and Intervention',
];

//These are the two catch all buckets that we must add to the bottom of the list.
//ORDER will matter here.
const OTHER_MAIN_TYPES = [
  'C2916', //Carcinoma not in main type (Other Carcinoma)
  'C3262', //Neoplasm not in main type (Other Neoplasm)
  'C2991', //Disease or Disorder (Other Disease)
];

/**
 * Facade wrapping a ClinicalTrialsService instance to create app specific methods
 * and simplify interacting with API.  Ported from ctapi-facade.ts from WCMS
 */

export function updateForm({ field, value }) {
  return {
    type: UPDATE_FORM,
    payload: {
      field,
      value,
    },
  };
}

export function receiveData(cacheKey, value) {
  return {
    type: RECEIVE_DATA,
    payload: {
      cacheKey,
      value,
    },
  };
}

export function clearForm() {
  return {
    type: CLEAR_FORM,
  };
}

export function getDiseasesForSimpleTypeAhead({
  name,
  size = 10,
  isDebug = true,
}) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'diseases',
      requests: [
        {
          method: 'getDiseases',
          requestParams: {
            category: ['maintype', 'subtype', 'stage'],
            ancestorId: undefined,
            additionalParams: {
              name,
              size,
              sort: 'cancergov',
              current_trial_status: VIEWABLE_TRIALS,
            },
          },
          fetchHandlers: {
            formatResponse: res => {
              console.log(res);

              let diseases = [...res];

              // TODO: DEBUG
              if (isDebug) {
                diseases.forEach(
                  disease =>
                    (disease.name += ' (' + disease.codes.join('|') + ')')
                );
              }
              
              return diseases;
            },
          },
        },
      ],
    },
  };
}

export function getCancerTypeDescendents({
  cacheKey,
  codes,
  size = 0,
  isDebug = false,
}) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey,
      requests: [
        getStages({ ancestorId: codes }),
        getSubtypes({ ancestorId: codes }),
        getFindings({ ancestorId: codes }),
      ],
    },
  };
}

/**
 * Gets all primary cancer types
 */
export function getMainType({ size = 0, isDebug = false }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'maintypeOptions',
      requests: [
        {
          method: 'getDiseases',
          requestParams: {
            category: 'maintype',
            ancestorId: undefined,
            additionalParams: {
              size,
              current_trial_status: VIEWABLE_TRIALS,
            },
          },
          fetchHandlers: {
            formatResponse: res => {
              let types = [];
              let otherTypes = [];

              res.forEach(disease => {
                if (OTHER_MAIN_TYPES.includes(disease.codes.join('|'))) {
                  otherTypes.push(disease);
                } else {
                  types.push(disease);
                }
              });

              let diseases = [
                { name: 'All', codes: [] },
                ...types.concat(otherTypes),
              ];

              if (isDebug) {
                diseases.forEach(
                  disease =>
                    (disease.name += ' (' + disease.codes.join('|') + ')')
                );
              }
              return diseases;
            },
          },
        },
      ],
    },
  };
}

/**
 * Gets cancer subtypes for a given parent ID
 */
export function getSubtypes({ ancestorId, size = 0, isDebug = false }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'subtypeOptions',
      requests: [
        {
          method: 'getDiseases',
          requestParams: {
            category: 'subtype',
            ancestorId: ancestorId,
            additionalParams: {
              size,
              current_trial_status: VIEWABLE_TRIALS,
            },
          },
          fetchHandlers: {
            formatResponse: diseases => {
              if (isDebug) {
                diseases.forEach(
                  disease =>
                    (disease.name += ' (' + disease.codes.join('|') + ')')
                );
              }
              return diseases;
            },
          },
        },
      ],
    },
  };
}

/**
 * Gets cancer stages for a given parent ID
 */
export function getStages({ ancestorId, size = 0, isDebug = false }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'stageOptions',
      requests: [
        {
          method: 'getDiseases',
          requestParams: {
            category: 'stage',
            ancestorId: ancestorId,
            additionalParams: {
              size,
              current_trial_status: VIEWABLE_TRIALS,
            },
          },
          fetchHandlers: {
            formatResponse: diseases => {
              // TODO: DEBUG
              if (isDebug) {
                diseases.forEach(
                  disease =>
                    (disease.name += ' (' + disease.codes.join('|') + ')')
                );
              }
              return diseases;
            },
          },
        },
      ],
    },
  };
}

/**
 * Gets cancer findings based on parent ID
 */
export function getFindings({ ancestorId, size = 0, isDebug = false }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'findingsOptions',
      requests: [
        {
          method: 'getDiseases',
          requestParams: {
            category: 'finding',
            ancestorId: ancestorId,
            additionalParams: {
              size,
              current_trial_status: VIEWABLE_TRIALS,
            },
          },
          fetchHandlers: {
            formatResponse: diseases => {
              // TODO: DEBUG
              if (isDebug) {
                diseases.forEach(
                  disease =>
                    (disease.name += ' (' + disease.codes.join('|') + ')')
                );
              }
              return diseases;
            },
          },
        },
      ],
    },
  };
}


export function getCountries({ size = 100 } = {}) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'countries',
      requests: [
        {
          method: 'getTerms',
          requestParams: {
            category: 'sites.org_country',
            additionalParams: {
              sort: 'term',
              current_trial_status: VIEWABLE_TRIALS,
            },
            size,
          },
          fetchHandlers: {
            formatResponse: terms => {
              return terms.map(term => term.term);
            },
          },
        },
      ],
    },
  };
}

/**
 * Gets hospital/institution to populate the Hospital/Institution field
 */
export function searchHospital({ searchText, size = 10 }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'hospitals',
      requests: [
        {
          method: 'getTerms',
          requestParams: {
            category: 'sites.org_name',
            additionalParams: {
              term: searchText,
              sort: 'term',
              current_trial_statuses: VIEWABLE_TRIALS,
            },
            size,
          },
        },
      ],
    },
  };
}

/**
 * Gets drugs intervention items for search field
 */
export function searchDrugs({ searchText, isDebug = false, size = 10 } = {}) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'drugOptions',

      requests: [
        {
          method: 'getInterventions',
          requestParams: {
            category: ['Agent', 'Agent Category'],
            searchText: searchText,
            size: size,
            additionalParams: {
              current_trial_status: VIEWABLE_TRIALS,
            },
            sort: 'cancergov',
          },
          fetchHandlers: {
            formatResponse: drugs => {
              if (isDebug) {
                drugs.forEach(
                  drug => (drug.name += ' (' + drug.codes.join('|') + ')')
                );
              }
              return drugs;
            },
          },
        },
      ],
    },
  };
}

/**
 * Gets other intervention items for search field
 */
export function searchOtherInterventions({ searchText, size = 10 } = {}) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'treatmentOptions',
      requests: [
        {
          method: 'getInterventions',
          requestParams: {
            category: 'Other',
            searchText: searchText,
            size: size,
            additionalParams: {
              current_trial_status: VIEWABLE_TRIALS,
            },
            sort: 'cancergov',
          },
          fetchHandlers: {
            formatResponse: (treatments, isDebug) => {
              if (isDebug) {
                treatments.forEach(
                  treatment =>
                    (treatment.name += ' (' + treatment.codes.join('|') + ')')
                );
              }
              return treatments;
            },
          },
        },
      ],
    },
  };
}

/**
 * Gets trial investigators to populate the Trial Investigators field
 */
export function searchTrialInvestigators({ searchText, size = 10 } = {}) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'tis',
      requests: [
        {
          method: 'getTerms',
          requestParams: {
            category: 'principal_investigator',
            additionalParams: {
              term: searchText,
              sort: 'term',
              current_trial_status: VIEWABLE_TRIALS,
            },
            size,
          },
        },
      ],
    },
  };
}

/**
 * Gets lead orgs to populate the Lead Organization field
 */
export function searchLeadOrg({ searchText, size = 10 } = {}) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'leadorgs',
      requests: [
        {
          method: 'getTerms',
          requestParams: {
            category: 'lead_org',
            additionalParams: {
              term: searchText,
              sort: 'term',
              current_trial_status: VIEWABLE_TRIALS,
            },
            size,
          },
        },
      ],
    },
  };
}


export function searchTrials(requestJSON = '') {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'trialsResults',
      requests: [
        {
          method: 'searchTrials',
          requestParams: {
             
          },
        }
      ]
    }
  }
}