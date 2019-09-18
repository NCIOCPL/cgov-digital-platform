import React from 'react';
import { Fieldset, TextInput } from '../../atomic';
import './CancerTypeKeyword.scss';

const CancerTypeKeyword = ({ handleUpdate }) => {
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Keyword"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch"
    >
      <TextInput
        action={handleUpdate}
        id="q"
        name="CancerTypeKeyword"
        label="Cancer Type/Keyword"
        placeHolder="Start typing to select a cancer type"
        labelHidden
      />
    </Fieldset>
  );
};

export default CancerTypeKeyword;
