import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';

const ZipCode = () => {
  return (
    <Fieldset
      id="zip"
      legend="U.S. Zip Code"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch">
      <input type="text" />
    </Fieldset>
  );
};

ZipCode.propTypes = {
};

ZipCode.defaultProps = {
};

export default ZipCode;
