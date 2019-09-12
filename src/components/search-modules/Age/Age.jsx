import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import TextInput from '../../atomic/TextInput';
import './Age.scss';

const Age = () => {
  return (
    <Fieldset
      id="age"
      legend="Age"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch">
      <TextInput id="a" label="Enter the age of the participant." maxLength={3} />
    </Fieldset>
  );
};

Age.propTypes = {
  
};

Age.defaultProps = {
  
};

export default Age;
