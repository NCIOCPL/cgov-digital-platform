import { RECEIVE_DATA } from '../identifiers';

export const defaultState = {
};

export const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case RECEIVE_DATA:
      return {
        ...state,
        [action.payload.cacheKey]: action.payload.value,
      };
    default:
      return {
        ...state,
      };
  }
};
