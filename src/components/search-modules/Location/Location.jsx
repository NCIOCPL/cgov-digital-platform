import React, { useState } from 'react';
import { Fieldset, TextInput, Radio, Toggle, Dropdown } from '../../atomic';
import './Location.scss';

const Location = ({ handleUpdate, useValue }) => {
  //Hooks must always be rendered in same order.
  let zip = useValue('zip');
  let radius = useValue('radius');
  let country = useValue('country');
  let city = useValue('city');
  let state = useValue('state');
  let hospital = useValue('hospital');
  const [activeRadio, setActiveRadio] = useState('search-location-all');
  const [limitToVA, setLimitToVA] = useState(false);

  const handleToggleChange = e => {
    setLimitToVA(e.target.checked);
  };

  const handleRadioChange = e => {
    setActiveRadio(e.target.value);
  };

  return (
    <Fieldset
      id="location"
      legend="Location"
      helpUrl="https://www.cancer.gov/about-cancer/treatment/clinical-trials/search/help#location"
      classes="search-location"
    >
      <p>
        Search for trials near a specific zip code; or in a country, state and
        city; or at a particular institution. The default selection will search
        for trials in all available locations.
      </p>
      <div className="data-toggle-block">
        <Toggle
          id="search-location-toggle"
          label="Limit results to Veterans Affairs facilities"
          onChange={handleToggleChange}
        />
        Limit results to Veterans Affairs facilities
      </div>
      <div className="group-locations">
        <Radio
          onChange={handleRadioChange}
          id="search-location-all"
          label="Search All Locations"
        />
        <Radio
          onChange={handleRadioChange}
          id="search-location-zip"
          label="ZIP Code"
        />
        {activeRadio === 'search-location-zip' && (
          <div className="search-location__zip">
            <TextInput
              action={handleUpdate}
              id="search-location-zip-input"
              name="zip"
              value={zip}
              classes="search-location__zip --zip"
              label="U.S. ZIP Code"
            />
            <Dropdown
              action={handleUpdate}
              id="search-location-radius"
              name="radius"
              value={radius}
              classes="search-location__zip --radius"
              label="Radius"
            >
              {[20, 50, 100, 200, 500].map(dist => {
                return (
                  <option key={dist} value={dist}>{`${dist} miles`}</option>
                );
              })}
            </Dropdown>
          </div>
        )}
        <Radio
          onChange={handleRadioChange}
          id="search-location-country"
          label="Country, State, City"
        />
        {activeRadio === 'search-location-country' && (
          <div className="search-location__country">
            <Dropdown
              action={handleUpdate}
              classes="search-location__country --country"
              name="country"
              value={country}
              label="Country"
            >
              {[
                'United States',
                'United Kingdom',
                'Zambia',
                'Japan',
                'Uruguay',
              ].map(city => {
                return <option key={city} value={city}>{`${city}`}</option>;
              })}
            </Dropdown>
            <div className="search-location__country --city-and-state">
              <TextInput
                action={handleUpdate}
                id="search-location-state"
                name="state"
                value={state}
                classes="search-location__country --state"
                label="State"
              />
              <TextInput
                action={handleUpdate}
                id="search-location-city"
                name="city"
                value={city}
                classes="search-location__country --city"
                label="City"
              />
            </div>
          </div>
        )}
        {!limitToVA && (
          <>
            <Radio
              onChange={handleRadioChange}
              id="search-location-hospital"
              label="Hospitals/Institutions"
            />
            {activeRadio === 'search-location-hospital' && (
              <div>
                <TextInput
                  action={handleUpdate}
                  id="search-location-hospital-field"
                  name="hospital"
                  value={hospital}
                  label=""
                />
              </div>
            )}
            <Radio
              onChange={handleRadioChange}
              id="search-location-nih"
              label="At NIH (only show trials at the NIH clinical center in Bethesda, MD)"
            />
          </>
        )}
      </div>
    </Fieldset>
  );
};

export default Location;
