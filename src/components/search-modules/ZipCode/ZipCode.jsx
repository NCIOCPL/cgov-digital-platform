import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import TextInput from '../../atomic/TextInput';

const ZipCode = () => {
  return (
    <Fieldset
      id="zip"
      legend="U.S. Zip Code"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch">
      <TextInput id="z" label="" maxLength={5} />
    </Fieldset>
  );
};

ZipCode.propTypes = {
};

ZipCode.defaultProps = {
};

export default ZipCode;
