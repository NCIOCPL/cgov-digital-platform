import React, { useEffect, useState } from 'react';
import { Dropdown } from '../../components/atomic';
import { getStateNameFromAbbr } from '../../utilities/utilities';

const SitesList = sites => {
  const [locArray, setLocArray] = useState([]);
  const [countries, setCountries] = useState([]);
  const [statesList, setStatesList] = useState([]);
  const [filteredLocArray, setFilteredLocArray] = useState([]);
  const [selectedState, setSelectedState] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('United States');
  const [statesItems, setStatesItems] = useState([]);

  const buildCountriesList = sitesArr => {
    if (sitesArr.length > 0) {
      let countriesList = [...new Set(sitesArr.map(item => item.org_country))];
      setCountries(countriesList);
    }
  };

  useEffect(() => {
    if (countries.length === 0) {
      buildCountriesList(sites.sites);
    }
  }, []);

  useEffect(() => {
    constructFilterableArray();
  }, [countries]);

  useEffect(() => {
    setFilteredLocArray(locArray);
  }, [locArray]);

  // build list per city
  const buildCitiesArray = parentArray => {
    let ca = []; //cities array
    let citiesList = [...new Set(parentArray.map(item => item.org_city))];

    citiesList.forEach(cityName => {
      let citySites = parentArray.filter(item => item.org_city === cityName);
      let cityObj = {
        city: cityName,
        sites: citySites,
      };
      ca.push(cityObj);
    });
    return ca;
  };

  //output location
  const constructFilterableArray = () => {
    let masterArray = [];
    countries.forEach(countryName => {
      let c = { country: countryName };
      if (countryName === 'United States') {
        let usaSites = sites.sites.filter(
          item => item.org_country === 'United States'
        );
        let sl = [...new Set(usaSites.map(item => item.org_state_or_province))];
        sl.sort((a, b) => (a > b ? 1 : -1));
        setStatesList(sl);
        c.states = [];

        sl.forEach(stateName => {
          let sitesByState = usaSites.filter(
            item => item.org_state_or_province === stateName
          );
          let stateSitesList = buildCitiesArray(sitesByState);
          let s = {
            state: stateName,
            cities: stateSitesList,
          };
          c.states.push(s);
        });
        setStatesItems(c);
        masterArray.unshift(c);
      } else if(countryName === 'Canada') {
        let canadaSites = sites.sites.filter(
          item => item.org_country === 'Canada'
        );
        let pl = [...new Set(canadaSites.map(item => item.org_state_or_province))];
        pl.sort((a, b) => (a > b ? 1 : -1));
        c.provinces = [];

        pl.forEach(provinceName => {
          let sitesByProvince = canadaSites.filter(
            item => item.org_state_or_province === provinceName
          );
          let provinceSitesList = buildCitiesArray(sitesByProvince);
          let s = {
            province: provinceName,
            cities: provinceSitesList,
          };
          c.provinces.push(s);
        });
        masterArray.push(c);
      }else {
        c.cities = buildCitiesArray(
          sites.sites.filter(item => item.org_country === countryName)
        );
        masterArray.push(c);
      }
      setLocArray(masterArray);
    });
  };

  const renderLocationBlock = (locationObj, index) => {
    return (
      <div key={'loc-' + locationObj.org_name} className="location">
        <strong className="location-name">{locationObj.org_name}</strong>
        <div>Status: {getTrialStatusForDisplay(locationObj.recruitment_status)}</div>
        <div>Contact: {locationObj.contact_name}</div>
        {locationObj.contact_phone && (
          <div>Phone: {locationObj.contact_phone}</div>
        )}
        {locationObj.contact_email && (
          <div>
            Email:{' '}
            <a href={`mailto:${locationObj.contact_email}`}>
              {locationObj.contact_email}
            </a>
          </div>
        )}
      </div>
    );
  };

  const handleFilterByCountry = e => {
    let filtered = [];
    if (e.target.value === 'other') {
      filtered = locArray.filter(
        item => item.country !== 'United States' && item.country !== 'Canada'
      );
    } else {
      filtered = locArray.filter(item => item.country === e.target.value);
    }
    setSelectedCountry(e.target.value);
    if (e.target.value !== 'United States') {
      setSelectedState('all');
    }
    setFilteredLocArray(filtered);
  };

  const handleFilterByState = e => {
    // the filtered array is already USA only
    let filtered = [];
    if (e.target.value !== '') {
      filtered = statesItems.states.filter(item => item.state === e.target.value);
    } else {
      filtered = statesItems;
    }
    setSelectedState(e.target.value);
    setFilteredLocArray(filtered);
  };

  const renderFilterDropdowns = () => {
    const otherCountries = countries.filter(
      country => country !== 'United States' && country !== 'Canada'
    );

    const mapStateOptions = () =>
      statesList.map((stateAbbr, idx) => (
        <option key={'state-' + idx} value={stateAbbr}>
          {getStateNameFromAbbr(stateAbbr)}
        </option>
      ));

    return countries.length > 1 || statesList.length > 1 ? (
      <>
        {countries.length > 1 && (
          <Dropdown
            label="Country:"
            action={handleFilterByCountry}
            value={selectedCountry}
          >
            {countries.includes('United States') && (
              <option value="United States">U.S.A.</option>
            )}
            {countries.includes('Canada') && (
              <option value="Canada">Canada</option>
            )}
            {otherCountries.length > 0 && <option value="other">Other</option>}
          </Dropdown>
        )}
        {statesList.length > 1 && selectedCountry === 'United States' && (
          <Dropdown
            label="State:"
            action={handleFilterByState}
            value={selectedState}
          >
            <option value="all">All</option>
            {mapStateOptions()}
          </Dropdown>
        )}
      </>
    ) : (
      <></>
    );
  };

  const renderSitesByCity = citiesArray => {
    return citiesArray.map((city, idx) => {
      return (
        <div className="location-city" key={'city' + idx}>
          <h5>{city.city}</h5>
          {city.sites.map(site => {
            return renderLocationBlock(site, idx);
          })}
        </div>
      );
    });
  };

  //render North American Sites
  const renderNASites = sitesArr => {
    return (
      <>
        {(sitesArr.country === 'United States')
          ? sitesArr.states.map((siteState, idx) => (
          <div className="location-state" key={'state-' + idx}>
            <h4>{getStateNameFromAbbr(siteState.state)}</h4>
            {renderSitesByCity(siteState.cities)}
          </div>
          ))
          : sitesArr.provinces.map((site, idx) => (
            <div className="location-province" key={'province-' + idx}>
              <h4>{site.province}</h4>
              {renderSitesByCity(site.cities)}
            </div>
          ))
        }
      </>
    );
  };

  const getTrialStatusForDisplay = statusKey => {
    const statuses = {
      ACTIVE: 'Active',
      CLOSED_TO_ACCRUAL: 'Closed to accrual',
      TEMPORARILY_CLOSED_TO_ACCRUAL: 'Temporarily closed to accrual',
    };
    return statuses[statusKey];
  };

  const generateListDisplay = () => {
    return filteredLocArray.length > 0 ? (
      filteredLocArray.map((country, idx) => {
        return (country.country === 'United States' || country.country === 'Canada') ? (
          <React.Fragment key={'country' + idx}>
            {renderNASites(country)}
          </React.Fragment>
        ) : (
          <div className="location-country" key={'country' + idx}>
            <h3>{country.country}</h3>
            {renderSitesByCity(country.cities)}
          </div>
        );
      })
    ) : (
      <>Loading List ...</>
    );
  };

  return (
    <>
      {renderFilterDropdowns()}
      {generateListDisplay()}
    </>
  );
};

export default SitesList;
