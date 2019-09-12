import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './TrialInvestigators.scss';

const TrialInvestigators = ({
  sampleProperty
}) => {
  return (
    <Fieldset
      id="trialinvestigator"
      legend="Trial Investigators"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialinvestigators">
      <input type="text" />
    </Fieldset>
  );
};

TrialInvestigators.propTypes = {
  sampleProperty: PropTypes.string
};

TrialInvestigators.defaultProps = {
  sampleProperty: 'TrialInvestigators'
};

export default TrialInvestigators;
