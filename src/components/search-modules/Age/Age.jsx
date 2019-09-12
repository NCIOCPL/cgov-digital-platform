import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './Age.scss';

const Age = () => {
  return (
    <Fieldset
      id="age"
      legend="Age"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch">
      <input type="text" />
    </Fieldset>
  );
};

Age.propTypes = {
  
};

Age.defaultProps = {
  
};

export default Age;
