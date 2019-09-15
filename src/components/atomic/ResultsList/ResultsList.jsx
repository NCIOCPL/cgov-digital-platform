import React from 'react';
import PropTypes from 'prop-types';

import ResultsListItem from '../ResultsListItem';
import './ResultsList.scss';

const ResultsList = ({ results, selectedResults, setSelectedResults }) => {
  console.log('selectedResults: ', selectedResults);

  const handleOnCheckChange = id => {
    if (selectedResults.indexOf(id) === -1) {
      setSelectedResults([...selectedResults, id]);
    } else {
      setSelectedResults(selectedResults.filter(item => item !== id));
    }
  };

  return (
    <div className="results-list">
      {results.map(item => {
        return (
          <ResultsListItem
            id={item.title}
            item={item}
            isChecked={selectedResults.indexOf(item.title) > -1}
            onCheckChange={handleOnCheckChange}
          />
        );
      })}
    </div>
  );
};

ResultsList.propTypes = {
  setSelectedResults: PropTypes.func,
  selectedResults: PropTypes.array,
  results: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      age: PropTypes.string.isRequired,
      gender: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
    })
  ),
};

ResultsList.defaultProps = {
  results: [],
};

export default ResultsList;
