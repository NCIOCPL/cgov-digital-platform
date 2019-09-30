import { UPDATE_FORM, CLEAR_FORM } from '../identifiers';

export const defaultState = {
  a: '', //Age
  ct: '', //Cancer Type/Condition
  st: [], //Subtype
  stg: [], //Stage
  fin: [], //Side effects (AKA "findings")
  q: '', //Cancer Type Keyword (ALSO Keyword Phrases)
  dt: '', //Drug/Drug family
  ti: '', //Other Treatments
  lo: '', //Lead Organization
  z: '', //Zipcode
  zp: '', //Radius
  lcnty: 'United States', //Country
  lst: '', //State
  lcty: '', //City
  hos: '', //Hospital
  tid: '', //Trial ID
  in: '', //Trial Investigators
  hv: false, //Healthy Volunteers,
  tt: [], //Trial Type
  tp: [], //Trial phase
  nih: false, //At NIH only
  va: false, //VA facilities only
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
