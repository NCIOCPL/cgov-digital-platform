import React from 'react';
import PropTypes from 'prop-types';
import './ResultsItem.scss';

const ResultsItem = ({
  sampleProperty
}) => {
  return (
    <div className="results-item">
      { sampleProperty }
    </div>
  );
};

ResultsItem.propTypes = {
  sampleProperty: PropTypes.string
};

ResultsItem.defaultProps = {
  sampleProperty: 'ResultsItem'
};

export default ResultsItem;
