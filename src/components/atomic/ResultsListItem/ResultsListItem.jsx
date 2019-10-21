import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';
import Checkbox from '../Checkbox';
import './ResultsListItem.scss';

const ResultsListItem = ({ id, item, isChecked, onCheckChange }) => {

  return (
    <div className="results-list-item results-list__item">
      <div className="results-list-item__checkbox">
        <Checkbox
          id={id || item.title}
          name={item.title}
          checked={isChecked}
          label="Select this article for print"
          hideLabel
          onChange={() => onCheckChange(id)}
        />
      </div>
      <div className="results-list-item__contents">
        <div className="results-list-item__title">
          <Link to='/v'>{item.title}</Link>
        </div>
        <div className="results-list-item__category"><span>Status:</span>{item.status ? 'Active' : 'Active'}</div>
        <div className="results-list-item__category"><span>Age:</span>{item.age} years and older</div>
        <div className="results-list-item__category"><span>Gender:</span>{item.gender}</div>
        <div className="results-list-item__category"><span>Location:</span>{item.location} locations</div>
      </div>
    </div>
  );
};

ResultsListItem.propTypes = {
  id: PropTypes.string,
  item: PropTypes.shape({
    title: PropTypes.string.isRequired,
    status: PropTypes.bool.isRequired,
    age: PropTypes.number.isRequired,
    gender: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
  }),
  isChecked: PropTypes.bool,
  onCheckChange: PropTypes.func.isRequired,
};

ResultsListItem.defaultProps = {
  results: [],
  isChecked: false
};

export default ResultsListItem;
