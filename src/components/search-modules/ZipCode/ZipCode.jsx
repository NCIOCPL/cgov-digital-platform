import React from 'react';
import {Fieldset, TextInput} from '../../atomic';

const ZipCode = () => {
  return (
    <Fieldset
      id="zip"
      legend="U.S. Zip Code"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#basicsearch">
      <TextInput id="z" label="" maxLength={5} />
    </Fieldset>
  );
};


export default ZipCode;
