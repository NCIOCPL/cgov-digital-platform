import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import TextInput from '../../atomic/TextInput';
import './LeadOrganization.scss';

const LeadOrganization = ({ handleUpdate }) => {
  return (
    <Fieldset
      id="location"
      legend="Location"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#leadorganization"
    >
      <TextInput
        action={handleUpdate}
        id="lo"
        name="leadOrganization"
        label="Search by Lead Organization."
      />
    </Fieldset>
  );
};

export default LeadOrganization;
