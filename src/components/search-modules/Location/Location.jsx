import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Fieldset, TextInput, Radio, Toggle, Dropdown } from '../../atomic';
import { getCountries } from '../../../store/actions';
import './Location.scss';

//TODO: Using mock list of states until API is ready;
import { getStates } from '../../../mocks/mock-autocomplete-util';

const Location = ({ handleUpdate }) => {
  //Hooks must always be rendered in same order.
  const dispatch = useDispatch();
  const { countries = [] } = useSelector(store => store.cache);
  const { z, zp, lcnty, lcty, lst, hos } = useSelector(
    store => store.form
  );
  const [activeRadio, setActiveRadio] = useState('search-location-all');
  const [limitToVA, setLimitToVA] = useState(false);
  const [showStateField, setShowStateField] = useState(true);
  useEffect(() => {
    if (activeRadio === 'search-location-country') {
      dispatch(getCountries());
    }
  }, [activeRadio, dispatch]);
  const handleToggleChange = () => {
    setLimitToVA(!limitToVA);
  };

  const handleRadioChange = e => {
    setActiveRadio(e.target.value);
  };

  const handleCountryOnChange = e => {
    const country = e.target.value;
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
          onClick={handleToggleChange}
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
                action={e => handleUpdate(e.target.id, e.target.value)}
                id="z"
                value={z}
                classes="search-location__zip --zip"
                label="U.S. ZIP Code"
              />
              <Dropdown
                action={e => handleUpdate(e.target.id, e.target.value)}
                id="zp"
                value={zp}
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
              id="lcnty"
              label="Country"
              action={handleCountryOnChange}
              value={lcnty}
            >
              {countries.map(city => {
                return <option key={city} value={city}>{`${city}`}</option>;
              })}
            </Dropdown>
            <div
              className={`search-location__country ${
                showStateField ? 'two-col' : ''
              }`}
            >
              {showStateField && (
                <Dropdown
                  id="lst"
                  classes="state"
                  label="State"
                  action={e => handleUpdate(e.target.id, e.target.value)}
                  value={lst}
                >
                  {getStates().map(state => {
                    return (
                      <option
                        key={state.abbr}
                        value={state.abbr}
                      >{`${state.name}`}</option>
                    );
                  })}
                </Dropdown>
              )}
              <TextInput
                action={e => handleUpdate(e.target.id, e.target.value)}
                id="lcty"
                label="City"
                value={lcty}
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
                  action={e => handleUpdate(e.target.id, e.target.value)}
                  id="hos"
                  label="Hospitals/Institutions"
                  labelHidden
                  value={hos}
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
