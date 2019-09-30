import querystring from 'query-string';
import { useDispatch, useSelector } from 'react-redux';
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
  isDebug = false,
}) {
  return {
    type: '@@cache/RETRIEVE',
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
            },
          },
          fetchHandlers: {
            formatResponse: diseases => {
              // TODO: DEBUG
              if (isDebug) {
                diseases.forEach(
                  disease =>
                    (disease.fieldName += ' (' + disease.codes.join('|') + ')')
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
  console.log('cacheKey: ', cacheKey);
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

export function getSubtypes({ ancestorId, size = 0, isDebug = false }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'subtypes',
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
              // TODO: DEBUG
              if (isDebug) {
                diseases.forEach(
                  disease =>
                    (disease.fieldName += ' (' + disease.codes.join('|') + ')')
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

export function getStages({ ancestorId, size = 0, isDebug = false }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'stages',
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
                    (disease.fieldName += ' (' + disease.codes.join('|') + ')')
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

export function getFindings({ ancestorId, size = 0, isDebug = false }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'findings',
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
                    (disease.fieldName += ' (' + disease.codes.join('|') + ')')
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

export function searchHospital({ searchText, size = 10 }) {
  return {
    type: '@@cache/RETRIEVE',
    payload: {
      service: 'ctsSearch',
      cacheKey: 'hospital',
      requests: [
        {
          method: 'getTerms',
          requestParams: {
            category: 'sites.org_name',
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
