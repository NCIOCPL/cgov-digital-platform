import React from 'react';

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
} from '../../components/search-modules';

const FormAdvanced = () => {
  const handleSubmit = e => {
    e.preventDefault();
    console.log('form submitted');
  };

  return (
    <form onSubmit={handleSubmit} className="search-page__form advanced">
      <CancerTypeCondition />
      <Age />
      <KeywordsPhrases />
      <Location />
      <TrialType />
      <DrugTreatment />
      <TrialPhase />
      <TrialId />
      <TrialInvestigators />
      <LeadOrganization />
    </form>
  );
};

export default FormAdvanced;
