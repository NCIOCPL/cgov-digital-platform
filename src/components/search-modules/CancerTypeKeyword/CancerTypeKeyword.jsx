import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import TextInput from '../../atomic/TextInput';
import './CancerTypeKeyword.scss';

const CancerTypeKeyword = () => {
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Keyword"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch">
      <TextInput id="q" label="Cancer Type/Keyword" placeHolder="Start typing to select a cancer type" labelHidden />
    </Fieldset>
  );
};

CancerTypeKeyword.propTypes = {
};

CancerTypeKeyword.defaultProps = {
};

export default CancerTypeKeyword;
