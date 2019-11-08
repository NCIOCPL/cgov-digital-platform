import { UPDATE_FORM, CLEAR_FORM } from '../identifiers';


export const defaultState = {
  age: '', // (a) Age
  cancerType: { name: '', codes: [] }, // (ct) Cancer Type/Condition
  subtypes: [], // (st) Subtype
  stages: [], // (stg) Stage
  findings: [], // (fin) Side effects
  keywordPhrases: '', // (q) Cancer Type Keyword (ALSO Keyword Phrases)
  zip: '', // (z) Zipcode
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
    { label: 'Phase I', value: 'I', checked: false },
    { label: 'Phase I', value: 'II', checked: false },
    { label: 'Phase III', value: 'III', checked: false },
    { label: 'Phase IV', value: 'IV', checked: false },
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
  refineSearch: false, //is the form in refine search mode
  ageModified: false,
  zipModified: false,
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

export const formatTrialSearchQuery = (state = defaultState) => {
  let filterCriteria = {}

    //diseases
    if(state.cancerType.codes.length > 0){
      filterCriteria._maintypes = state.cancerType.codes[0];
    }

    if(state.subtypes.codes.length > 0) {
      filterCriteria._subtypes = state.subtypes.codes;
    }

    if(state.stages.codes.length > 0) {
      filterCriteria._stages =  state.stages.codes;
    }

    if(state.findings.codes.length > 0) {
      filterCriteria._findings = state.findings;
    }

    //Drugs and Treatments
    if(state.drugs.length > 0 || state.treatments.length > 0) {
      let drugAndTrialIds = [];
      if(state.drugs.length > 0) {
        drugAndTrialIds = [...state.drugs];
      }
      if(state.treatments.length > 0) {
        drugAndTrialIds = [drugAndTrialIds, ...state.drugs];
      }
      filterCriteria.arms.interventions.intervention_code = drugAndTrialIds;
    }

    //Add Age filter
    if(state.age !== ''){
      filterCriteria.eligibility.structured.max_age_in_years_gte = state.age;
      filterCriteria.eligibility.structured.min_age_in_years_lte = state.age;
    }

    // keywords
    if(state.keywords !== '') {
      filterCriteria._fulltext = state.keywords;
    }

    // trialTypes
    //check if all or none are selected, none being the same as all
    // if(state.trialTypes.every(type => !type.checked) || trialTypes.every(type => type.checked)) {

    // }else {
    //   let tt = trialTypes.filter().

    //   primary_purpose.primary_purpose_code = 
    // }
    

    // filterCriteria.primary_purpose.primary_purpose_code = 

    // trialPhases


    // investigator
    if(state.investigator !== ''){
      filterCriteria.principal_investigator_fulltext  = state.investigator;
    }

    // leadOrg
    if(state.leadOrg !== ''){
      filterCriteria.lead_org_fulltext = state.leadOrg;
    }

    // add healthy volunteers filter
    filterCriteria.accepts_healthy_volunteers_indicator = (state.healthyVolunteers)? 'YES' : 'NO';

    //trial ids
    if(state.trialId !== ''){
      filterCriteria.sites.org_va = state.trialId;
    }

  return filterCriteria;
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
