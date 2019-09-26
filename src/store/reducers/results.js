import { RECEIVE_DATA } from '../identifiers';

export const defaultState = {
  diseases: [],
  countries: [],
  subtypes: [],
  stages: [],
  findings: []
}

export const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case RECEIVE_DATA:
      return {
        ...state,
        [action.payload.field]: action.payload.value,
      };
    default:
      return {
        ...state,
      };
  }
};
