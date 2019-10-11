import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Fieldset,
  TextInput,
  Radio,
  Toggle,
  Dropdown,
  Autocomplete,
} from '../../atomic';
import { getCountries, searchHospital } from '../../../store/actions';
import { matchItemToTerm, sortItems } from '../../../utilities/utilities';
import './Location.scss';

import { getStates } from '../../../mocks/mock-autocomplete-util';

const Location = ({ handleUpdate }) => {
  //Hooks must always be rendered in same order.
  const dispatch = useDispatch();

  const { countries = [] } = useSelector(store => store.cache);
  const { location, zip, zipRadius, country, city, state, hospital, nih, va } = useSelector(
    store => store.form
  );
  const [activeRadio, setActiveRadio] = useState(location);
  const [limitToVA, setLimitToVA] = useState(va);
  const [closeToNIH, setCloseToNIH] = useState(nih);
  const [showStateField, setShowStateField] = useState(true);

  const [hospitalName, setHospitalName] = useState({ value: '' });

  //hospital
  const { hospitals = [] } = useSelector(store => store.cache);

  useEffect(() => {
    handleUpdate('hos', hospitalName);
  }, [hospitalName, handleUpdate]);

  useEffect(() => {
    if (hospitalName.value.length > 2) {
      dispatch(searchHospital({ searchText: hospitalName.value }));
    }
  }, [hospitalName, dispatch]);

  useEffect(() => {
    handleUpdate('location', activeRadio);

    if (activeRadio === 'search-location-country') {
      dispatch(getCountries());
    }
    setCloseToNIH(activeRadio === 'search-location-nih');
  }, [activeRadio, dispatch]);

  useEffect(() => {
    handleUpdate('va', limitToVA);
  }, [limitToVA, handleUpdate]);

  useEffect(() => {
    handleUpdate('nih', closeToNIH);
  }, [closeToNIH, handleUpdate]);

  const handleToggleChange = () => {
    setLimitToVA(!limitToVA);
  };

  const handleRadioChange = e => {
    setActiveRadio(e.target.value);
  };

  const handleCountryOnChange = e => {
    const country = e.target.value;
    handleUpdate('country', country);
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
          checked={limitToVA}
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
                id="zip"
                value={zip}
                classes="search-location__zip --zip"
                label="U.S. ZIP Code"
              />
              <Dropdown
                action={e => handleUpdate(e.target.id, e.target.value)}
                id="zipRadius"
                value={zipRadius}
                classes="search-location__zip --radius"
                label="Radius"
              >
                {['20', '50', '100', '200', '500'].map(dist => {
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
              id="country"
              label="Country"
              action={handleCountryOnChange}
              value={country}
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
                  value={state}
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
                id="city"
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
                <Autocomplete
                  label="hospitals / institutions"
                  labelHidden
                  value={hospitalName.value}
                  inputProps={{
                    id: 'hos',
                    placeholder: 'Hospital/Institution name',
                  }}
                  wrapperStyle={{
                    position: 'relative',
                    display: 'inline-block',
                  }}
                  items={hospitals}
                  getItemValue={item => item.term}
                  shouldItemRender={matchItemToTerm}
                  sortItems={sortItems}
                  onChange={(event, value) => setHospitalName({ value })}
                  onSelect={(value, item) => {
                    handleUpdate('hospital', item);
                    setHospitalName({value: item.term});
                  }}
                  renderMenu={children => (
                    <div className="cts-autocomplete__menu --hospitals">
                      {hospitalName.value.length > 2 ? (
                        hospitals.length ? (
                          children
                        ) : (
                          <div className="cts-autocomplete__menu-item">
                            No results found
                          </div>
                        )
                      ) : (
                        <div className="cts-autocomplete__menu-item">
                          Please enter 3 or more characters
                        </div>
                      )}
                    </div>
                  )}
                  renderItem={(item, isHighlighted) => (
                    <div
                      className={`cts-autocomplete__menu-item ${
                        isHighlighted ? 'highlighted' : ''
                      }`}
                      key={item.termKey}
                    >
                      {item.term}
                    </div>
                  )}
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
