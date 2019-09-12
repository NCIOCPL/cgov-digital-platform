import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './LeadOrganization.scss';

const LeadOrganization = () => {
  return (
    <Fieldset
      id="location"
      legend="Location"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#leadorganization">
      <input type="text" />
    </Fieldset>
  );
};

LeadOrganization.propTypes = {
  sampleProperty: PropTypes.string
};

LeadOrganization.defaultProps = {
  sampleProperty: 'LeadOrganization'
};

export default LeadOrganization;
