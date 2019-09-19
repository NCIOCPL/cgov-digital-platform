import React from 'react';
import { Fieldset, TextInput } from '../../atomic';
import './LeadOrganization.scss';

const LeadOrganization = ({ handleUpdate, useValue }) => {
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
        value={useValue('leadOrganization')}
        label="Search by Lead Organization."
      />
    </Fieldset>
  );
};

export default LeadOrganization;
