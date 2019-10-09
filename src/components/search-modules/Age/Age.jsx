import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Fieldset, TextInput } from '../../atomic';

const Age = ({ handleUpdate }) => {
  const age = useSelector(store => store.form.a);
  const [errorMsg, setErrorMsg] = useState('');

  const validateAgeEntry = () => {
    let parsedAge = parseInt(age);
    if (
      Number.isNaN(parsedAge) ||
      parsedAge > 120 ||
      parsedAge < 0
    ) {
      setErrorMsg('Please enter a number between 1 and 120.');
    }else {
      setErrorMsg('');
    }
  };

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
        label="age"
        labelHidden
        errorMessage={errorMsg}
        inputHelpText="Your age helps determine which trials are right for you."
        maxLength={3}
        onBlur={validateAgeEntry}
      />
    </Fieldset>
  );
};

export default Age;
