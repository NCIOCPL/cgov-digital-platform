import React from 'react';
import PropTypes from 'prop-types';
import './ResultsPage.scss';

const ResultsPage = ({
  sampleProperty
}) => {

  return (
  <div className="general-page-body-container">
    <div className="contentzone">
      {/* */}
      <article className="results-page">
      { sampleProperty }
      <a href="/search">Go to Search Page</a>
      </article>
      {/* */}
    </div>
  </div>
  );
};

ResultsPage.propTypes = {
  sampleProperty: PropTypes.string
};

ResultsPage.defaultProps = {
  sampleProperty: 'ResultsPage'
};

export default ResultsPage;
