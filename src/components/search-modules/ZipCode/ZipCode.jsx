import React, {useState, useEffect} from 'react';
import { useSelector } from 'react-redux';
import { Fieldset, TextInput } from '../../atomic';
import {useZipConversion} from '../../../utilities/hooks';

const ZipCode = ({ handleUpdate }) => {
  const { zip } = useSelector(store => store.form);
  const [errorMsg, setErrorMsg] = useState('');
  const [inputtedZip, setInputtedZip] = useState('');
  const [{ getZipCoords }] = useZipConversion(inputtedZip, handleUpdate);

  useEffect(() => {
    if(inputtedZip !== ''){
      getZipCoords(inputtedZip);
    }
  }, [inputtedZip]);

  const handleZipUpdate = e => {
    const zipInput = e.target.value;

    if(zipInput.length === 5){
      // test that all characters are numbers
      if(/^[0-9]+$/.test(zipInput)){
        setErrorMsg('');
        setInputtedZip(zipInput);
        handleUpdate('zip', zipInput);
        handleUpdate('location', 'search-location-zip');
      } else {
        handleUpdate('hasInvalidZip', true);
        handleUpdate('zip', '');
        setErrorMsg(`${zipInput} is not a valid U.S. zip code`);
      }
    }
  };

  return (
    <Fieldset
      id="zip"
      legend="U.S. Zip Code"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch"
    >
      <TextInput
        action={handleZipUpdate}
        id="zip"
        label="zip code"
        labelHidden
        errorMessage={errorMsg}
        inputHelpText="Show trials near this U.S. ZIP code."
        maxLength={5}
        value={zip}
      />
    </Fieldset>
  );
};

export default ZipCode;
