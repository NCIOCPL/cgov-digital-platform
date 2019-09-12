import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './TrialPhase.scss';

const TrialPhase = () => {
  return (
    <Fieldset
      id="trialphase"
      legend="Trial Phase"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialphase">
      <input type="text" />
    </Fieldset>
  );
};

TrialPhase.propTypes = {
  sampleProperty: PropTypes.string
};

TrialPhase.defaultProps = {
  sampleProperty: 'TrialPhase'
};

export default TrialPhase;
