import { UPDATE_FORM, CLEAR_FORM } from '../identifiers';

export const defaultState = {
  age: '', // (a) Age
  cancerType: { name: '', codes: [] }, // (ct) Cancer Type/Condition
  subtypes: [], // (st) Subtype
  stages: [], // (stg) Stage
  findings: [], // (fin) Side effects

  q: '', // (q)Cancer Type Keyword (ALSO Keyword Phrases)

  leadOrg: { term: '', termKey: '' }, //(lo)Lead Organization
  zip: '', //(z)Zipcode
  zipRadius: '100', //(zp) Radius
  country: 'United States', // (lcnty) Country
  state: '', //(lst) State
  city: '', //(lcty) City
  hospital: '', //(hos) Hospital
  tid: '', //(tid) Trial ID,
  inv: { value: '' }, //(in) Trial investigators ('in' is legacy but is a keyword and does not work well as a key name; be ready to handle both in query string)
  hv: false, //(hv) Healthy Volunteers,
  tt: [], // (tt) Trial Type
  tp: [], // (tp) Trial phase
  nih: false, // At NIH only
  va: false, // VA facilities only

  location: 'search-location-all', // active location option (search-location-all | search-location-zip | search-location-country | search-location-hospital | search-location-nih)
  drugs: [], // (dt) Drug/Drug famil
  treatments: [], // (ti) Treatment/Interventions
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
