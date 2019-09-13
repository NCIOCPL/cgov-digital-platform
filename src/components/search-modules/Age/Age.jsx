import React from 'react';
import {Fieldset, TextInput} from '../../atomic';

const Age = () => {
  return (
    <Fieldset
      id="age"
      legend="Age"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch">
      <TextInput id="a" label="Enter the age of the participant." maxLength={3} />
    </Fieldset>
  );
};

export default Age;
