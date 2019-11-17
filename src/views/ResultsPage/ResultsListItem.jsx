import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/atomic/Checkbox';
import { isWithinRadius } from '../../utilities/utilities';

const ResultsListItem = ({ id, item, isChecked, onCheckChange }) => {
  const { zip, zipCoords, zipRadius } = useSelector(store => store.form);
  const [nearbySitesCount, setNearbySitesCount] = useState(0);

  function countNearbySitesByZip(arr) {
    return arr.reduce(
      (count, siteItem) =>
        count + isWithinRadius(zipCoords, siteItem.coordinates, zipRadius),
      0
    );
  }

  const getGenderDisplay = genderVal => {
    const displays = {
      MALE: 'Male',
      FEMALE: 'Female',
      BOTH: 'Male or Female',
    };
    return displays[genderVal];
  };

  const getAgeDisplay = () => {
    if (
      item.eligibilityInfo.structuredCriteria.minAgeInt === 0 &&
      item.eligibilityInfo.structuredCriteria.maxAgeInt > 120
    ) {
      return 'Not Specified';
    }
    if (
      item.eligibilityInfo.structuredCriteria.minAgeInt === 0 &&
      item.eligibilityInfo.structuredCriteria.maxAgeInt < 120
    ) {
      return `${item.eligibilityInfo.structuredCriteria.minAgeInt} years and younger`;
    }
    if (
      item.eligibilityInfo.structuredCriteria.minAgeInt > 0 &&
      item.eligibilityInfo.structuredCriteria.maxAgeInt < 120
    ) {
      return `${item.eligibilityInfo.structuredCriteria.minAgeInt} to ${item.eligibilityInfo.structuredCriteria.maxAgeInt} years`;
    }
    if (
      item.eligibilityInfo.structuredCriteria.minAgeInt > 0 &&
      item.eligibilityInfo.structuredCriteria.maxAgeInt > 120
    ) {
      return `${item.eligibilityInfo.structuredCriteria.minAgeInt} years and over`;
    }
  };

  const getLocationDisplay = () => {
    if (item.sites.length === 1) {
      const site = item.sites[0];
      let displayText = `${site.name}, ${site.city}, `;
      displayText +=
        site.country === 'United States'
          ? site.stateOrProvinceAbbreviation
          : site.country;
      return displayText;
    }
    // zip code present
    if (zip !== '') {
      //has a zip
      if (zipCoords.lat !== '' && zipCoords.lon !== '') {
        return `${item.sites.length} location${
          item.sites.length === 1 ? '' : 's'
        }, including ${countNearbySitesByZip(item.sites)} near you`;
      }
      if (nearbySitesCount > 0) {
        return `${item.sites.length} location${
          item.sites.length === 1 ? '' : 's'
        }, including ${nearbySitesCount} near you`;
      }
    }
    return `${item.sites.length} location${item.sites.length === 1 ? '' : 's'}`;
  };

  return (
    <div className="results-list-item results-list__item">
      <div className="results-list-item__checkbox">
        <Checkbox
          id={id || item.nciID}
          name={item.nciID}
          checked={isChecked}
          label="Select this article for print"
          hideLabel
          onChange={() => onCheckChange(id)}
        />
      </div>
      <div className="results-list-item__contents">
        <div className="results-list-item__title">
          <Link
            to={`/about-cancer/treatment/clinical-trials/search/v?id=${item.nciID}`}
          >
            {item.briefTitle}
          </Link>
        </div>
        <div className="results-list-item__category">
          <span>Status:</span>
          {item.currentTrialStatus ? 'Active' : 'Active'}
        </div>
        <div className="results-list-item__category">
          <span>Age:</span>
          {getAgeDisplay()}
        </div>
        <div className="results-list-item__category">
          <span>Gender:</span>
          {getGenderDisplay(item.eligibilityInfo.structuredCriteria.gender)}
        </div>
        <div className="results-list-item__category">
          <span>Location:</span>
          {getLocationDisplay()}
        </div>
      </div>
    </div>
  );
};

ResultsListItem.propTypes = {
  id: PropTypes.string,
  item: PropTypes.object,
  isChecked: PropTypes.bool,
  onCheckChange: PropTypes.func.isRequired,
};

ResultsListItem.defaultProps = {
  results: [],
  isChecked: false,
};

export default ResultsListItem;
