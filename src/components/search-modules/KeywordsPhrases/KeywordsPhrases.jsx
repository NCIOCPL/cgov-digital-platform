import React from 'react';
import { useSelector } from 'react-redux';
import { Fieldset, TextInput } from '../../atomic';

const KeywordsPhrases = ({ handleUpdate }) => {
  const {keywordPhrases, keywordPhrasesModified} = useSelector(store => store.form);

  const handleKeywordUpdate = (e) => {
    handleUpdate(e.target.id, e.target.value);
    handleUpdate('keywordPhrasesModified', false);
  }

  return (
    <Fieldset
      id="keyword"
      legend="Keywords/Phrases"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#keywords"
    >
      <TextInput
        action={handleKeywordUpdate}
        id="keywordPhrases"
        modified={keywordPhrasesModified}
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
