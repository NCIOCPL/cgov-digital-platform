import React, {useState} from 'react';
import { useSelector } from 'react-redux';
import { Fieldset, TextInput } from '../../atomic';
import {convertZipToLatLong} from '../../../utilities/utilities';

const ZipCode = ({ handleUpdate }) => {
  const { zip } = useSelector(store => store.form);
  const [errorMsg, setErrorMsg] = useState('');

  const handleZipUpdate = e => {
    if(e.target.value.length === 5){
      const zipLookup = convertZipToLatLong(e.target.value);
      if(zipLookup && zipLookup.lon !== ''){
        setErrorMsg('');
        handleUpdate(e.target.id, e.target.value);
        handleUpdate('zipCoords', zipLookup);
        handleUpdate('location', 'search-location-zip');
      } else {
        handleUpdate('zip', '');
        handleUpdate('zipCoords', {lat: '', lon: ''});
        setErrorMsg(`${e.target.value} is not a valid U.S. zip code`);
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
