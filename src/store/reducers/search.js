import {
  UPDATE_FORM,
  CLEAR_FORM,
  RECEIVE_DATA
} from '../identifiers';

export const defaultState = {
  type: '',
  age: '',
  zip: '',
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
