import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Checkbox from '../../components/atomic/Checkbox';

const ResultsListItem = ({ id, item, isChecked, onCheckChange }) => {

  const getGenderDisplay = genderVal => {
    const displays = {
      MALE: 'Male',
      FEMALE: 'Female',
      BOTH: 'Male or Female',
    };
    return displays[genderVal];
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
          <Link to={`/about-cancer/treatment/clinical-trials/search/v?id=${item.nciID}`}>
            {item.briefTitle}
          </Link>
        </div>
        <div className="results-list-item__category">
          <span>Status:</span>
          {item.currentTrialStatus  ? 'Active' : 'Active'}
        </div>
        <div className="results-list-item__category">
          <span>Age:</span>
          {item.eligibilityInfo.structuredCriteria.minAgeInt} years and older
        </div>
        <div className="results-list-item__category">
          <span>Gender:</span>
          {getGenderDisplay(item.eligibilityInfo.structuredCriteria.gender)}
        </div>
        <div className="results-list-item__category">
          <span>Location:</span>
          {`${item.sites.length} location${(item.sites.length === 1)? '': 's'}`}
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
