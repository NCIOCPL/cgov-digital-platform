import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { Checkbox, ResultsList, Delighter, Pager } from '../../components/atomic';
import './ResultsPage.scss';

const ResultsPage = ({ results }) => {
  const [selectAll, setSelectAll] = useState(false);
  const [paginatedResults, setPaginatedResults] = useState([]);
  const [selectedResults, setSelectedResults] = useState([]);

  useEffect(() => {
    if (selectAll) {
      setSelectedResults([...paginatedResults.map(result => result.title)]);
    } else {
      setSelectedResults([]);
    }
  }, [selectAll]);

  useEffect(() => {
    setSelectedResults([]);
  }, [paginatedResults]);

  useEffect(() => {
    if (selectedResults.length === 0) {
      setSelectAll(false);
    } else if (paginatedResults.length === selectedResults.length) {
      setSelectAll(true);
    }
  }, [paginatedResults, selectedResults]);

  const handlePagination = (slicedResults) => {
    setPaginatedResults([...slicedResults]);
  }

  const renderDelighters = () => (
    <div className="cts-delighter-container">
      <Delighter
        classes="cts-livehelp"
        url="/contact"
        titleText={
          <>
            Have a question?
            <br />
            We're here to help
          </>
        }
      >
        <p>
          <strong>Chat with us:</strong> LiveHelp
          <br />
          <strong>Call us:</strong> 1-800-4-CANCER
          <br />
          (1-800-422-6237)
        </p>
      </Delighter>

      <Delighter
        classes="cts-what"
        url="/about-cancer/treatment/clinical-trials/what-are-trials"
        titleText={<>What Are Cancer Clinical Trials?</>}
      >
        <p>Learn what they are and what you should know about them.</p>
      </Delighter>

      <Delighter
        classes="cts-which"
        url="/about-cancer/treatment/clinical-trials/search/trial-guide"
        titleText={<>Which trials are right for you?</>}
      >
        <p>
          Use the checklist in our guide to gather the information you’ll need.
        </p>
      </Delighter>
    </div>
  );

  return (
    <div className="general-page-body-container">
      <div className="contentzone">
        {/* */}
        <article className="results-page">
          <div className="results-page__control">
            <Checkbox
              id="select-all-checkbox"
              name="select-all"
              label="Select All on Page"
              classes="results-page__select-all"
              checked={selectAll}
              onChange={() => setSelectAll(!selectAll)}
            />
            <Pager data={results} callback={handlePagination}/>
          </div>
          <div className="results-page__content">
            {
              <ResultsList
                results={paginatedResults}
                selectedResults={selectedResults}
                setSelectedResults={setSelectedResults}
              />
            }
            <aside className="results-page__aside">{renderDelighters()}</aside>
          </div>
        </article>
        {/* */}
      </div>
    </div>
  );
};

ResultsPage.propTypes = {
  results: PropTypes.array,
};

ResultsPage.defaultProps = {
  results: [],
};

export default ResultsPage;
