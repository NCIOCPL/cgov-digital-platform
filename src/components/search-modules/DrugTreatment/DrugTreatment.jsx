import React from 'react';
import { Fieldset, TextInput } from '../../atomic';
import './DrugTreatment.scss';

const DrugTreatment = () => {
  const placeholder = 'Please enter 3 or more characters';
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Condition"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#cancertype"
    >
      <p>
        Search for a specific drug or intervention. You can use the drug's
        generic or brand name.
      </p>
      <TextInput
        id="search-drug-family"
        type="text"
        label="Drug/Drug Family"
        placeHolder={placeholder}
      />
      <TextInput
        id="search-drug-other"
        type="text"
        label="Other Treatments"
        placeHolder={placeholder}
      />
    </Fieldset>
  );
};

export default DrugTreatment;
