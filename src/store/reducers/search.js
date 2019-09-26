import { UPDATE_FORM, CLEAR_FORM } from '../identifiers';

export const defaultState = {
  age: '',
  cancerTypeCondition: '',
  cancerTypeKeyword: '',
  drugFamily: '',
  otherTreatements: '',
  keywordPhrases:'',
  leadOrganization:'',
  zip:'',
  radius:'',
  country: 'United States',
  state: '',
  city: '',
  hospital: '',
  trialId: '',
  trialInvestigators: '',
  healthyVolunteers: false,
  trialPhase: [],
  trialType: [],
};

export const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case UPDATE_FORM:
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    case CLEAR_FORM:
      return {
        ...defaultState,
      };
    default:
      return {
        ...state,
      };
  }
};
