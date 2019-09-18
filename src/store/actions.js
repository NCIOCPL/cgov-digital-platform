import {
  UPDATE_FORM,
  CLEAR_FORM,
  RECEIVE_DATA
} from './identifiers';

export function updateForm({ field, value }) {
  return {
      type: UPDATE_FORM,
      payload: {
          field,
          value
      }
  };
}

export function receiveData(payload) {
  return {
      type: RECEIVE_DATA,
      payload
  };
}