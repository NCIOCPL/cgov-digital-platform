import React from 'react';
import Fieldset from '../../atomic/Fieldset';
import './CancerTypeCondition.scss';

const CancerTypeCondition = () => {
  return (
    <Fieldset
      id="type"
      legend="Cancer Type/Condition"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#cancertype">
      <input type="text" />
    </Fieldset>
  );
};

export default CancerTypeCondition;
