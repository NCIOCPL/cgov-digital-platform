import {
  UPDATE_FORM,
  CLEAR_FORM,
  RECEIVE_DATA
} from '../identifiers';

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
  country: '',
  state: '',
  city: '',
  hospital:'',
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
    case RECEIVE_DATA:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return {
        ...state,
      };
  }
}
