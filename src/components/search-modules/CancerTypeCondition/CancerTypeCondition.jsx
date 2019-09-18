import React from 'react';
import { Fieldset, TextInput } from '../../atomic';
import './CancerTypeCondition.scss';

const CancerTypeCondition = () => {
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Condition"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#cancertype"
    >
      <p>
        Select a cancer type or condition. Select additional options, if
        applicable.
      </p>
      <TextInput id="q" label="Primary Cancer Type/Condition" />
      <TextInput id="st" label="Subtype" />
      <TextInput id="stage" label="Stage" />
      <TextInput id="fin" label="Side Effects/Biomarkers/Participant Attributes" />
    </Fieldset>
  );
};

export default CancerTypeCondition;
