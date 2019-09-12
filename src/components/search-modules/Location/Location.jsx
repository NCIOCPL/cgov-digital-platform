import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './Location.scss';

const Location = () => {
  return (
    <Fieldset
      id="location"
      legend="Location"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#location">
      <input type="text" />
    </Fieldset>
  );
};

Location.propTypes = {
  sampleProperty: PropTypes.string
};

Location.defaultProps = {
  sampleProperty: 'Location'
};

export default Location;
