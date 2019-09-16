import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Fieldset from '../../atomic/Fieldset';
import TextInput from '../../atomic/TextInput';
import Radio from '../../atomic/Radio';
import './Location.scss';

const Location = () => {
  const [activeRadio, setActiveRadio] = useState('search-location-all');

  const handleRadioChange = (e) => {
    console.log('e: ', e.target.value);
    setActiveRadio(e.target.value)
  }

  return (
    <Fieldset
      id="location"
      legend="Location"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#location"
    >
      <Radio onChange={handleRadioChange} id="search-location-all" label="Search All Locations" />
      <Radio onChange={handleRadioChange} id="search-location-zip" label="ZIP Code" />
      <div>
        <TextInput label="U.S. ZIP Code" disabled={activeRadio !== 'search-location-zip'}/>
        <TextInput label="Radius" disabled={activeRadio !== 'search-location-zip'}/>
      </div>
      <Radio onChange={handleRadioChange} id="search-location-country" label="Country, State, City" />
      <div>
        <TextInput label="Country" disabled={activeRadio !== 'search-location-country'}/>
        <TextInput label="State" disabled={activeRadio !== 'search-location-country'}/>
        <TextInput label="City" disabled={activeRadio !== 'search-location-country'}/>
      </div>
      <Radio onChange={handleRadioChange} id="search-location-hospital" label="Hospitals/Institutions" />
      <div>
        <TextInput label="" disabled={activeRadio !== 'search-location-hospital'}/>
      </div>
      <Radio onChange={handleRadioChange}
        id="search-location-nih"
        label="At NIH (only show trials at the NIH clinical center in Bethesda, MD)"
      />
    </Fieldset>
  );
};

// Location.propTypes = {
//   sampleProperty: PropTypes.string
// };

// Location.defaultProps = {
//   sampleProperty: 'Location'
// };

export default Location;
