import React from 'react';
import { Fieldset, TextInput } from '../../atomic';
import './CancerTypeCondition.scss';

const CancerTypeCondition = ({ handleUpdate }) => {
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Condition"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#cancertype"
    >
      <TextInput
        action={handleUpdate}
        id="cancerTypeCondition"
        name="cancerTypeCondition"
        type="text"
      />
    </Fieldset>
  );
};

export default CancerTypeCondition;
