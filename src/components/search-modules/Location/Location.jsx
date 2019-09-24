import React, { useState } from 'react';
import { Fieldset, TextInput, Radio, Toggle, Dropdown } from '../../atomic';
import './Location.scss';

//TODO: Using mock list of states until API is ready;
import {getStates} from '../../../mocks/mock-autocomplete-util';

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
  const [showStateField, setShowStateField] = useState(true);

  const handleToggleChange = e => {
    setLimitToVA(e.target.checked);
  };

  const handleRadioChange = e => {
    setActiveRadio(e.target.value);
  };

  const handleCountryOnChange = country => {
    if (country === 'United States') {
      setShowStateField(true);
    } else {
      setShowStateField(false);
    }
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
          checked={activeRadio === 'search-location-all'}
        />
        <Radio
          onChange={handleRadioChange}
          id="search-location-zip"
          label="ZIP Code"
          checked={activeRadio === 'search-location-zip'}
        />
        {activeRadio === 'search-location-zip' && (
          <div className="search-location__block search-location__zip">
            <div className="two-col">
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
          </div>
        )}
        <Radio
          onChange={handleRadioChange}
          id="search-location-country"
          label="Country, State, City"
          checked={activeRadio === 'search-location-country'}
        />
        {activeRadio === 'search-location-country' && (
          <div className="search-location__block search-location__country">
            <Dropdown
              classes="search-location__country --country"
              name="country"
              label="Country"
              action={handleCountryOnChange}
              value={country}
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
            <div className={`search-location__country ${showStateField ? 'two-col' : ''}`}>
              {showStateField && (
                <Dropdown
                  id="search-location-state"
                  classes="state"
                  label="State"
                  action={handleUpdate}
                  value={state}
                >
                  {getStates().map(state => {
                    return <option key={state.abbr} value={state.abbr}>{`${state.name}`}</option>;
                  })}
                </Dropdown>
              )}
              <TextInput
                action={handleUpdate}
                id="search-location-city"
                label="City"
                value={city}
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
              checked={activeRadio === 'search-location-hospital'}
            />
            {activeRadio === 'search-location-hospital' && (
              <div className="search-location__block">
                <TextInput
                  action={handleUpdate}
                  id="hos"
                  label="Hospitals/Institutions"
                  name="hospital"
                  labelHidden
                  value={hospital}
                  placeHolder="Please enter 3 or more characters"
                />
              </div>
            )}
            <Radio
              onChange={handleRadioChange}
              id="search-location-nih"
              label="At NIH (only show trials at the NIH clinical center in Bethesda, MD)"
              checked={activeRadio === 'search-location-nih'}
            />
          </>
        )}
      </div>
    </Fieldset>
  );
};

export default Location;
