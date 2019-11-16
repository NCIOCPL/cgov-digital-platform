import { LOAD_GLOBAL, LOAD_GLOBALS } from '../identifiers';

export const initialState = {
  printCacheEndpoint: '',
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_GLOBAL:
      return {
        ...state,
        [action.payload.key]: action.payload.value,
      };
    case LOAD_GLOBALS:
      return {
        ...state,
        ...action.payload,
      };
    default:
      return state;
  }
};
