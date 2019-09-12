import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './CancerTypeKeyword.scss';

const CancerTypeKeyword = () => {
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Keyword"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch">
      <input type="text" />
    </Fieldset>
  );
};

CancerTypeKeyword.propTypes = {
};

CancerTypeKeyword.defaultProps = {
};

export default CancerTypeKeyword;
