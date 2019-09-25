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

export function receiveData(field, value) {
  return {
    type: RECEIVE_DATA,
    payload: {
      field,
      value,
    },
  };
}

export function getDiseasesForSimpleTypeAhead({
  name,
  size = 10,
  isDebug = false,
}) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'getDiseases',
      category: ['maintype', 'subtype', 'stage'],
      params: undefined,
      options: {
        name,
        size,
        sort: 'cancergov',
      },
      fetchHandlers: {
        formatResponse: diseases => {
          // TODO: DEBUG
          if (isDebug) {
            diseases.forEach(
              disease => (disease.name += ' (' + disease.codes.join('|') + ')')
            );
          }
          return diseases;
        },
      },
      resultName: 'diseases',
    },
  };
}

export function getMainType({ size = 0, isDebug = false }) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'getDiseases',
      category: 'maintype',
      params: undefined,
      options: {
        size,
        current_trial_status: VIEWABLE_TRIALS,
      },
      fetchHandlers: {
        formatResponse: diseases => {
          const types = [];
          const otherTypes = [];

          diseases.forEach(disease => {
            if (OTHER_MAIN_TYPES.includes(disease.codes.join('|'))) {
              otherTypes.push(disease);
            } else {
              types.push(disease);
            }
          });

          const newDiseases = types.concat(otherTypes);
          //TODO: DEBUG
          if (isDebug) {
            newDiseases.forEach(
              disease => (disease.name += ' (' + disease.codes.join('|') + ')')
            );
          }
          return diseases;
        },
      },
      resultName: 'mainType',
    },
  };
}

export function getSubtypes({ ancestorID, size = 0, isDebug = false }) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'getDiseases',
      category: 'subtype',
      params: ancestorID,
      options: {
        size,
        current_trial_status: VIEWABLE_TRIALS,
      },
      fetchHandlers: {
        formatResponse: diseases => {
          // TODO: DEBUG
          if (isDebug) {
            diseases.forEach(
              disease => (disease.name += ' (' + disease.codes.join('|') + ')')
            );
          }
          return diseases;
        },
      },
      resultName: 'subtypes',
    },
  };
}

export function getStages({ ancestorID, size = 0, isDebug = false }) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'getDiseases',
      category: 'stage',
      params: ancestorID,
      options: {
        size,
        current_trial_status: VIEWABLE_TRIALS,
      },
      fetchHandlers: {
        formatResponse: diseases => {
          // TODO: DEBUG
          if (isDebug) {
            diseases.forEach(
              disease => (disease.name += ' (' + disease.codes.join('|') + ')')
            );
          }
          return diseases;
        },
      },
      resultName: 'stages',
    },
  };
}

export function getFindings({ ancestorID, size = 0, isDebug = false }) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'getDiseases',
      category: 'finding',
      params: ancestorID,
      options: {
        size,
        current_trial_status: VIEWABLE_TRIALS,
      },
      fetchHandlers: {
        formatResponse: diseases => {
          // TODO: DEBUG
          if (isDebug) {
            diseases.forEach(
              disease => (disease.name += ' (' + disease.codes.join('|') + ')')
            );
          }
          return diseases;
        },
      },
      resultName: 'findings',
    },
  };
}

// export function getCountries() {
//   return {
//     type: '@@api/CTS',
//     payload: {
//       service: 'getTerms',
//       category: 'sites.org_country',
//       options: {
//         sort: 'term',
//         current_trial_status: VIEWABLE_TRIALS,
//       },
//       fetchHandlers: {
//         formatResponse: terms => {
//           return terms.map(term => term.term);
//         },
//       },
//       resultName: 'countries',
//     },
//   };
// }

// export function searchHospital(searchText) { 

//   return {
//     type: '@@api/CTS',
//     payload: {
//       service: 'getTerms',
//       category: 'sites.org_name',
//       options: {
//         term: searchText,
//         sort: 'term',
//         current_trial_status: VIEWABLE_TRIALS,
//       },
//       resultName: 'hospital',
//     },
//   };
// }