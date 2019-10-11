import React from 'react';
import { useSelector } from 'react-redux';
import { Fieldset, TextInput } from '../../atomic';

const ZipCode = ({ handleUpdate }) => {
  const { zip } = useSelector(store => store.form);
  
  return (
    <Fieldset
      id="zip"
      legend="U.S. Zip Code"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch"
    >
      <TextInput
        action={e => handleUpdate(e.target.id, e.target.value)}
        id="zip"
        label="zip code"
        labelHidden
        inputHelpText="Show trials near this U.S. ZIP code."
        maxLength={5}
        value={zip}
      />
    </Fieldset>
  );
};

export default ZipCode;
