import React from 'react';
import { Fieldset, TextInput } from '../../atomic';
import './CancerTypeCondition.scss';

const CancerTypeCondition = ({ handleUpdate, useValue }) => {
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Condition"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#cancertype"
    >
<<<<<<< HEAD
      <TextInput
        action={handleUpdate}
        id="cancerTypeCondition"
        name="cancerTypeCondition"
        value={useValue('cancerTypeCondition')}
        type="text"
      />
=======
      <p>
        Select a cancer type or condition. Select additional options, if
        applicable.
      </p>
      <TextInput id="q" label="Primary Cancer Type/Condition" />
      <TextInput id="st" label="Subtype" />
      <TextInput id="stage" label="Stage" />
      <TextInput id="fin" label="Side Effects/Biomarkers/Participant Attributes" />
>>>>>>> 0d6359b5864272369127a33c3a4609d19f3ca437
    </Fieldset>
  );
};

export default CancerTypeCondition;
