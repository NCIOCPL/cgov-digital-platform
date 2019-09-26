import React from 'react';
import PropTypes from 'prop-types';
import { Fieldset, TextInput } from '../../atomic';
import './TrialId.scss';

const TrialId = ({ handleUpdate, useValue }) => {
  return (
    <Fieldset
      id="trialid"
      legend="Trial ID"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialid"
    >
      <TextInput
        action={handleUpdate}
        name="trialId"
        value={useValue('trialId')}
        id="tid"
        type="text"
        label="Separate multiple IDs with commas or semicolons."
      />
    </Fieldset>
  );
};

TrialId.propTypes = {
  handleUpdate: PropTypes.func,
  useValue: PropTypes.func
};

export default TrialId;
