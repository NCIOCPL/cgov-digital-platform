import React from 'react';
import { useSelector } from 'react-redux';
import { Fieldset, TextInput } from '../../atomic';
import './KeywordsPhrases.scss';

const KeywordsPhrases = ({ handleUpdate }) => {
  const keywordPhrases = useSelector(store => store.form.q);
  return (
    <Fieldset
      id="keyword"
      legend="Keywords/Phrases"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#keywords"
    >
      <TextInput
        action={e => handleUpdate(e.target.id, e.target.value)}
        id="q"
        value={keywordPhrases}
        label="Keywords phrases"
        labelHidden
        inputHelpText="Search by word or phrase (use quotation marks with phrases)."
        placeHolder="Examples: PSA, 'Paget disease'"
      />
    </Fieldset>
  );
};

export default KeywordsPhrases;
