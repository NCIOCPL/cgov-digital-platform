import React from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import './KeywordsPhrases.scss';

const KeywordsPhrases = () => {
  return (
    <Fieldset
      id="keyword"
      legend="Keywords/Phrases"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#keywords">
      <input type="text" />
    </Fieldset>
  );
};

KeywordsPhrases.propTypes = {
};

KeywordsPhrases.defaultProps = {
};

export default KeywordsPhrases;
