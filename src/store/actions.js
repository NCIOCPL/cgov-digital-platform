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

export function getDiseasesForSimpleTypeAhead({ name, size = 10 }) {
  return {
    type: '@@api/CTS',
    payload: {
      service: 'getDiseases',
      queries: ['maintype', 'subtype', 'stage'],
      params: undefined,
      options: {
        name,
        size,
        sort: 'cancergov',
      },
      fetchHandlers: {
        formatResponse: diseases => {
          //TODO: DEBUG
          // if (this.isDebug) {
          //   diseases.forEach(
          //     disease => (disease.name += ' (' + disease.codes.join('|') + ')')
          //   );
          // }
          return diseases;
        },
      },
      resultName: 'diseases'
    },
  };
}
