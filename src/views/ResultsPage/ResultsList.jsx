import React from 'react';
import PropTypes from 'prop-types';
import ResultsListItem from './ResultsListItem';


const ResultsList = ({ results, selectedResults, setSelectedResults, setSelectAll }) => {
  const handleOnCheckChange = id => {
    if (selectedResults.indexOf(id) === -1) {
      setSelectedResults([...selectedResults, id]);
    } else {
      // remove from selected
      setSelectAll(false);
      setSelectedResults(selectedResults.filter(item => item !== id));
    }
  };

  return (
    <div className="results-list">
      {results.map(item => {
        return (
          <ResultsListItem
            key={item.nciID}
            id={item.nciID}
            item={item}
            isChecked={selectedResults.indexOf(item.nciID) > -1}
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
  results: PropTypes.array
};

ResultsList.defaultProps = {
  results: [],
  selectedResults: []
};

export default ResultsList;
