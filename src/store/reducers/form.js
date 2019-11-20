import { UPDATE_FORM, CLEAR_FORM } from '../identifiers';

export const defaultState = {
  age: '', // (a) Age
  cancerType: { name: '', codes: [] }, // (ct) Cancer Type/Condition
  subtypes: [], // (st) Subtype
  stages: [], // (stg) Stage
  findings: [], // (fin) Side effects
  keywordPhrases: '', // (q) Cancer Type Keyword (ALSO Keyword Phrases)
  zip: '', // (z) Zipcode
  zipCoords: {lat: '', lon: ''},
  zipRadius: '100', //(zp) Radius
  country: 'United States', // (lcnty) Country
  states: [], // (lst) State
  city: '', // (lcty) City
  hospital: { term: '', termKey: '' }, // (hos) Hospital
  healthyVolunteers: false, // (hv) Healthy Volunteers,
  trialTypes: [
    { label: 'Treatment', value: 'treatment', checked: false },
    { label: 'Prevention', value: 'prevention', checked: false },
    { label: 'Supportive Care', value: 'supportive_care', checked: false },
    {
      label: 'Health Services Research',
      value: 'health_services_research',
      checked: false,
    },
    { label: 'Diagnostic', value: 'diagnostic', checked: false },
    { label: 'Screening', value: 'screening', checked: false },
    { label: 'Basic Science', value: 'basic_science', checked: false },
    { label: 'Other', value: 'other', checked: false },
  ], // (tt) Trial Type
  trialPhases: [
    { label: 'Phase I', value: 'i', checked: false },
    { label: 'Phase II', value: 'ii', checked: false },
    { label: 'Phase III', value: 'iii', checked: false },
    { label: 'Phase IV', value: 'iv', checked: false },
  ], // (tp) Trial phase
  nihOnly: false, // (nih) At NIH only
  vaOnly: false, // (va) VA facilities only
  drugs: [], // (dt) Drug/Drug family
  treatments: [], // (ti) Treatment/Interventions
  trialId: '', // (tid) Trial ID,
  investigator: { term: '', termKey: '' }, // (in) Trial investigators ('in' is legacy but is a keyword and does not work well as a key name; be ready to handle both in query string)
  leadOrg: { term: '', termKey: '' }, // (lo) Lead Organization
  
  formType: 'basic', // (basic (default) | advanced)
  isDirty: false, // only updated after submission of either form
  zipModified: false,
  hasInvalidZip: false, // zip does not return coodinates
  refineSearch: false, //is the form in refine search mode
  ageModified: false,
  cancerTypeModified: false,
  subtypeModified: false,
  stagesModified: false,
  keywordPhrasesModified: false,
  location: 'search-location-all', // active location option (search-location-all | search-location-zip | search-location-country | search-location-hospital | search-location-nih)
};

export function addArrayValues(paramName, srcArray) {
  let params = '';
  if(srcArray.length > 0){
    let p = `&${paramName}=`;
    params += p;
    params += srcArray.map(e => e.codes ).join(p);
  }
  return params;
}

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
