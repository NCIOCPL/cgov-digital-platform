import React from 'react';
import { Fieldset, TextInput } from '../../atomic';

const Age = ({ handleUpdate, useValue }) => {
  return (
    <Fieldset
      id="age"
      legend="Age"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch"
    >
      <TextInput
        action={handleUpdate}
        id="a"
        name="age"
        value={useValue('age')}
        label="Your age helps determine which trials are right for you."
        maxLength={3}
      />
    </Fieldset>
  );
};

export default Age;
