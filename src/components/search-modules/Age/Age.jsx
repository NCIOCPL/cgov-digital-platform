import React from 'react';
import { useSelector } from 'react-redux';
import { Fieldset, TextInput } from '../../atomic';

const Age = ({ handleUpdate }) => {
  const age = useSelector(store => store.form.a);
  return (
    <Fieldset
      id="age"
      legend="Age"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch"
    >
      <TextInput
        action={e => handleUpdate(e.target.id, e.target.value)}
        id="a"
        value={age}
        label="Your age helps determine which trials are right for you."
        maxLength={3}
      />
    </Fieldset>
  );
};

export default Age;
