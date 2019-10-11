import { UPDATE_FORM, CLEAR_FORM } from '../identifiers';

export const defaultState = {
  a: '', // (a) Age
  cancerType: {name: '', codes: []}, // (ct) Cancer Type/Condition
  subtypes: [], // (st) Subtype
  stages: [], // (stg) Stage
  findings: [], // (fin) Side effects 
  q: '', //Cancer Type Keyword (ALSO Keyword Phrases)
  dt: '', //Drug/Drug family
  ti: '', //Treatment/Interventions
  lo: {value: ''}, //Lead Organization
  z: '', //Zipcode
  zp: 100, //Radius
  lcnty: 'United States', //Country
  lst: '', //State
  lcty: '', //City
  hos: '', //Hospital
  tid: '', //Trial ID,
  inv: {value: ''}, // Trial investigators ('in' is legacy but is a keyword and does not work well as a key name; be ready to handle both in query string)
  hv: false, //Healthy Volunteers,
  tt: [], //Trial Type
  tp: [], //Trial phase
  nih: false, //At NIH only
  va: false, //VA facilities only

  location: 'search-location-all', // active location option (search-location-all | search-location-zip | search-location-country | search-location-hospital | search-location-nih)
  drugs: [],
  treatments: [],
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
