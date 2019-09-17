import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import PropTypes from 'prop-types';

import {
  CancerTypeCondition,
  Age,
  KeywordsPhrases,
  Location,
  TrialType,
  DrugTreatment,
  TrialPhase,
  TrialId,
  TrialInvestigators,
  LeadOrganization,
} from '../../../components/search-modules';

const FormAdvanced = submitFn => {
  const [redirectToResults, setRedirectToResults] = useState(false);

  const handleSubmit = e => {
    e.preventDefault();
    setRedirectToResults(true);
  };

  if (redirectToResults) {
    return <Redirect push to="/r" />;
  }

  return (
    <form onSubmit={handleSubmit} className="search-page__form advanced">
      <CancerTypeCondition />
      <div className="side-by-side">
        <Age />
        <KeywordsPhrases />
      </div>
      <Location />
      <TrialType />
      <DrugTreatment />
      <TrialPhase />
      <TrialId />
      <TrialInvestigators />
      <LeadOrganization />
      <div className="submit-block">
        <button type="submit" className="btn-submit">
          Find Trials
        </button>
      </div>
    </form>
  );
};

FormAdvanced.propTypes = {
  submitFn: PropTypes.func,
};

FormAdvanced.defaultProps = {
  submitFn: () => {},
};

export default FormAdvanced;
