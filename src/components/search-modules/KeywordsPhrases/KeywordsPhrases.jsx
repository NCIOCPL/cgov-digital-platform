import React from 'react';
import {Fieldset, TextInput} from '../../atomic';
import './KeywordsPhrases.scss';

const KeywordsPhrases = () => {
  return (
    <Fieldset
      id="keyword"
      legend="Keywords/Phrases"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#keywords">
      <TextInput id="q" label="Search by word or phrase (use quotation marks with phrases)." placeHolder="Examples: PSA, 'Paget disease'" />
    </Fieldset>
  );
};

export default KeywordsPhrases;
