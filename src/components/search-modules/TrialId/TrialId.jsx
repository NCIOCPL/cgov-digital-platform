import React from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Fieldset, TextInput } from '../../atomic';

const TrialId = ({ handleUpdate }) => {
  const trialId = useSelector(store => store.form.trialId);

  return (
    <Fieldset
      id="trialid"
      legend="Trial ID"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#trialid"
    >
      <TextInput
        action={e => handleUpdate(e.target.id, e.target.value)}
        value={trialId}
        id="trialId"
        type="text"
        label="Trial ID"
        labelHidden
        inputHelpText="Separate multiple IDs with commas or semicolons."
      />
    </Fieldset>
  );
};

TrialId.propTypes = {
  handleUpdate: PropTypes.func,
};

export default TrialId;
