import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './TrialId.scss';

const TrialId = () => {
  return (
    <Fieldset
      id="trialid"
      legend="Trial ID"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialid">
      <input type="text" />
    </Fieldset>
  );
};

TrialId.propTypes = {
  sampleProperty: PropTypes.string
};

TrialId.defaultProps = {
  sampleProperty: 'TrialId'
};

export default TrialId;
