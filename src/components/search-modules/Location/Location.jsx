import React, { useState } from 'react';
import { Fieldset, TextInput, Radio, Toggle, Dropdown } from '../../atomic';
import './Location.scss';

const Location = () => {
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
          <div className="search-location__block search-location__zip">
            <div className="--two-col">
              <TextInput
                id="search-location-zip-input"
                classes="zip"
                label="U.S. ZIP Code"
                maxLength={5}
              />
              <Dropdown
                id="search-location-radius"
                classes="radius"
                label="Radius"
                value={100}
              >
                {[20, 50, 100, 200, 500].map(dist => {
                  return (
                    <option key={dist} value={dist}>{`${dist} miles`}</option>
                  );
                })}
              </Dropdown>
            </div>
          </div>
        )}
        <Radio
          onChange={handleRadioChange}
          id="search-location-country"
          label="Country, State, City"
        />
        {activeRadio === 'search-location-country' && (
          <div className="search-location__block search-location__country">
            <Dropdown classes="country" label="Country">
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
            <div className="search-location__country --two-col">
              <TextInput
                id="search-location-state"
                classes="state"
                label="State"
              />
              <TextInput
                id="search-location-city"
                classes="city"
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
              <div className="search-location__block">
                <TextInput
                  id="hos"
                  label="Hospitals/Institutions"
                  labelHidden
                  placeHolder="Please enter 3 or more characters"
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
