import React from 'react';
import {Fieldset, TextInput} from '../../atomic';
import './TrialInvestigators.scss';

const TrialInvestigators = () => {
  return (
    <Fieldset
      id="trialinvestigator"
      legend="Trial Investigators"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialinvestigators">
      <TextInput id="in" label="Search by Trial Investigators." />
    </Fieldset>
  );
};

export default TrialInvestigators;
