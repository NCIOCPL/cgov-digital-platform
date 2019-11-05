import React, { useEffect, useState } from 'react';
import { Dropdown } from '../../components/atomic';
import { getStateNameFromAbbr } from '../../utilities/utilities';

const SitesList = sites => {
  const [locArray, setLocArray] = useState([]);
  const [countries, setCountries] = useState([]);
  const [statesList, setStatesList] = useState([]);

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
        masterArray.unshift(c);
      } else {
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
      <div key={index} className="location">
        <strong className="location-name">{locationObj.org_name}</strong>
        <div>Status: {locationObj.recruitment_status}</div>
        <div>Contact: {locationObj.contact_name}</div>
        <div>Phone: {locationObj.contact_phone}</div>
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

  const renderFilterDropdowns = () => {
    const mapCountryOptions = () =>
      countries.map((country, idx) => (
        <option key={idx} value={country.country}>
          {country.country}
        </option>
      ));

    const mapStateOptions = () =>
      statesList.map((stateAbbr, idx) => (
        <option key={idx} value={stateAbbr}>
          {getStateNameFromAbbr(stateAbbr)}
        </option>
      ));

    return countries.length > 1 || statesList.length > 1 ? (
      <>
        {countries.length > 1 && (
          <Dropdown label="Country">
            <option value="">All</option>
            {mapCountryOptions()}
          </Dropdown>
        )}
        {statesList.length > 1 && (
          <Dropdown label="State">
            <option value="">All</option>
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
        <div className="location-city" key={idx}>
          <h5>{city.city}</h5>
          {city.sites.map(site => {
            return renderLocationBlock(site, idx);
          })}
        </div>
      );
    });
  };

  const renderUSASites = usaSites => {
    return (
      <>
        {countries.length > 1 && <h3>United States</h3>}
        {usaSites.states.map((siteState, idx) => (
          <div className="location-state" key={idx}>
            <h4>{getStateNameFromAbbr(siteState.state)}</h4>
            {renderSitesByCity(siteState.cities)}
          </div>
        ))}
      </>
    );
  };

  const generateListDisplay = () => {

    return locArray.length > 0 ? (
      locArray.map((country, idx) => {
        return country.country === 'United States' ? (
          <React.Fragment key={idx}>{renderUSASites(country)}</React.Fragment>
        ) : (
          <React.Fragment key={idx}>
            {renderSitesByCity(country.cities)}
          </React.Fragment>
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
