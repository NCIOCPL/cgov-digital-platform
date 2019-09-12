import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './TrialType.scss';

const TrialType = () => {
  return (
    <Fieldset
      id="trialtype"
      legend="Trial Type"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialtype">
      <input type="text" />
    </Fieldset>
  );
};

TrialType.propTypes = {
  sampleProperty: PropTypes.string
};

TrialType.defaultProps = {
  sampleProperty: 'TrialType'
};

export default TrialType;
