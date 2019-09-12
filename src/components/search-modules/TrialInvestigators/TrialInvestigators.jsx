import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import TextInput from '../../atomic/TextInput';
import './TrialInvestigators.scss';

const TrialInvestigators = ({
  sampleProperty
}) => {
  return (
    <Fieldset
      id="trialinvestigator"
      legend="Trial Investigators"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialinvestigators">
      <TextInput id="in" label="Search by Trial Investigators." />
    </Fieldset>
  );
};

TrialInvestigators.propTypes = {
};

TrialInvestigators.defaultProps = {
};

export default TrialInvestigators;
