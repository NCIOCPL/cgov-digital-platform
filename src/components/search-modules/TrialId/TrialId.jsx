import React from 'react';
import PropTypes from 'prop-types';
import { Fieldset, TextInput } from '../../atomic';
import './TrialId.scss';

const TrialId = () => {
  return (
    <Fieldset
      id="trialid"
      legend="Trial ID"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialid"
    >
      <TextInput
        id="tid"
        type="text"
        label="Separate multiple IDs with commas or semicolons."
      />
    </Fieldset>
  );
};

TrialId.propTypes = {
  sampleProperty: PropTypes.string,
};

TrialId.defaultProps = {
  sampleProperty: 'TrialId',
};

export default TrialId;
