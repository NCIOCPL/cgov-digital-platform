import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { SearchCriteriaTable } from '../../components/atomic';

const ResultsPageHeader = ({ resultsCount }) => {
  return (
    <div className="cts-results-header">
      <p>
        <strong>Results 1-10 of {resultsCount} for your search</strong>
      </p>

      <SearchCriteriaTable />
      <p className="reset-form">
        <Link to="/search">Start Over</Link>
        <span aria-hidden="true" className="separator">|</span>
        <Link to="/search?f=a">Refine Search Criteria</Link>
      </p>
    </div>
  );
};

ResultsPageHeader.propTypes = {
  resultsCount: PropTypes.string,
};

export default ResultsPageHeader;
